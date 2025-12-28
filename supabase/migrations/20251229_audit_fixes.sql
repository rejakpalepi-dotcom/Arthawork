-- =====================================================
-- CRITICAL FIXES FROM TECHNICAL AUDIT
-- Created: 2024-12-29
-- =====================================================

-- =====================================================
-- 1. FIX: Missing Foreign Key on todos.user_id
-- =====================================================
ALTER TABLE public.todos 
ADD CONSTRAINT todos_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================
-- 2. CREATE: Database-Level Audit Trail
-- Replace localStorage-based audit with proper DB table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Action details
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  
  -- Change data (for data modifications)
  old_data JSONB,
  new_data JSONB,
  
  -- Request context
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_record ON audit_logs(record_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() = user_id);

-- Policy: System can insert (via service role)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- =====================================================
-- 3. CREATE: Invoice History/Versioning
-- Track all changes to invoices for compliance
-- =====================================================
CREATE TABLE IF NOT EXISTS public.invoice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  
  -- Version tracking
  version INTEGER NOT NULL,
  
  -- Snapshot of invoice data at this version
  data JSONB NOT NULL,
  
  -- Who made the change
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL DEFAULT 'update' CHECK (change_type IN ('create', 'update', 'status_change', 'delete')),
  change_reason TEXT,
  
  -- Timestamp
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_invoice_history_invoice ON invoice_history(invoice_id);
CREATE INDEX idx_invoice_history_changed_at ON invoice_history(changed_at DESC);
CREATE UNIQUE INDEX idx_invoice_history_version ON invoice_history(invoice_id, version);

-- Enable RLS
ALTER TABLE public.invoice_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view history of their invoices
CREATE POLICY "Users can view their invoice history"
ON public.invoice_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE invoices.id = invoice_history.invoice_id
    AND invoices.user_id = auth.uid()
  )
);

-- =====================================================
-- 4. TRIGGER: Auto-create invoice history on changes
-- =====================================================
CREATE OR REPLACE FUNCTION log_invoice_history()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
  FROM public.invoice_history
  WHERE invoice_id = NEW.id;
  
  -- Determine change type
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.invoice_history (
      invoice_id, version, data, changed_by, change_type
    ) VALUES (
      NEW.id, 
      next_version, 
      row_to_json(NEW)::jsonb, 
      NEW.user_id, 
      'create'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if something actually changed
    IF OLD IS DISTINCT FROM NEW THEN
      INSERT INTO public.invoice_history (
        invoice_id, version, data, changed_by, change_type
      ) VALUES (
        NEW.id, 
        next_version, 
        row_to_json(NEW)::jsonb, 
        auth.uid(), 
        CASE WHEN OLD.status != NEW.status THEN 'status_change' ELSE 'update' END
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER invoice_history_trigger
  AFTER INSERT OR UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION log_invoice_history();

-- =====================================================
-- 5. FUNCTION: Log audit event (for Edge Functions)
-- =====================================================
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, table_name, record_id, 
    old_data, new_data, ip_address, user_agent
  ) VALUES (
    auth.uid(), p_action, p_table_name, p_record_id,
    p_old_data, p_new_data, p_ip_address, p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
