-- =====================================================
-- Indonesian Tax Engine (PPh 21/23)
-- Created: 2026-01-03
-- =====================================================

-- =====================================================
-- 1. MODIFY INVOICES TABLE - Add tax columns
-- =====================================================
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS tax_type TEXT CHECK (tax_type IN ('pph21', 'pph23', 'none')),
  ADD COLUMN IF NOT EXISTS tax_mode TEXT CHECK (tax_mode IN ('include', 'exclude')) DEFAULT 'exclude',
  ADD COLUMN IF NOT EXISTS client_has_npwp BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS client_npwp_number TEXT,
  ADD COLUMN IF NOT EXISTS pph_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pph_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_amount NUMERIC;

-- =====================================================
-- 2. MODIFY CLIENTS TABLE - Add NPWP fields
-- =====================================================
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS npwp_number TEXT,
  ADD COLUMN IF NOT EXISTS client_type TEXT CHECK (client_type IN ('individual', 'corporate')) DEFAULT 'individual';

-- =====================================================
-- 3. TAX SUMMARY TABLE
-- Annual/monthly tax recap for SPT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tax_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Period
  tax_year INTEGER NOT NULL,
  tax_month INTEGER, -- NULL for annual summary
  
  -- Summary data
  total_gross_income NUMERIC DEFAULT 0,
  total_pph21_paid NUMERIC DEFAULT 0,
  total_pph23_withheld NUMERIC DEFAULT 0,
  total_net_income NUMERIC DEFAULT 0,
  
  -- Invoice breakdown
  invoice_count INTEGER DEFAULT 0,
  invoice_ids UUID[] DEFAULT '{}',
  
  -- Timestamps
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- One summary per user per period
  CONSTRAINT tax_summary_user_period_unique UNIQUE (user_id, tax_year, tax_month)
);

-- =====================================================
-- 4. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.tax_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tax summaries"
  ON public.tax_summary FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_invoices_tax_type ON public.invoices(tax_type);
CREATE INDEX IF NOT EXISTS idx_clients_npwp ON public.clients(npwp_number);
CREATE INDEX IF NOT EXISTS idx_clients_type ON public.clients(client_type);
CREATE INDEX IF NOT EXISTS idx_tax_summary_user_year ON public.tax_summary(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_summary_period ON public.tax_summary(tax_year, tax_month);

-- =====================================================
-- 6. FUNCTION TO REFRESH TAX SUMMARY
-- =====================================================
CREATE OR REPLACE FUNCTION refresh_tax_summary(p_user_id UUID, p_year INTEGER, p_month INTEGER DEFAULT NULL)
RETURNS void AS $$
DECLARE
  v_gross NUMERIC;
  v_pph21 NUMERIC;
  v_pph23 NUMERIC;
  v_net NUMERIC;
  v_count INTEGER;
  v_ids UUID[];
BEGIN
  -- Calculate totals from invoices
  SELECT 
    COALESCE(SUM(total), 0),
    COALESCE(SUM(CASE WHEN tax_type = 'pph21' THEN pph_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN tax_type = 'pph23' THEN pph_amount ELSE 0 END), 0),
    COALESCE(SUM(net_amount), 0),
    COUNT(*),
    ARRAY_AGG(id)
  INTO v_gross, v_pph21, v_pph23, v_net, v_count, v_ids
  FROM public.invoices
  WHERE user_id = p_user_id
    AND status IN ('sent', 'paid')
    AND EXTRACT(YEAR FROM issue_date) = p_year
    AND (p_month IS NULL OR EXTRACT(MONTH FROM issue_date) = p_month);

  -- Upsert summary
  INSERT INTO public.tax_summary (
    user_id, tax_year, tax_month,
    total_gross_income, total_pph21_paid, total_pph23_withheld,
    total_net_income, invoice_count, invoice_ids, calculated_at
  )
  VALUES (
    p_user_id, p_year, p_month,
    v_gross, v_pph21, v_pph23,
    v_net, v_count, v_ids, now()
  )
  ON CONFLICT (user_id, tax_year, tax_month)
  DO UPDATE SET
    total_gross_income = EXCLUDED.total_gross_income,
    total_pph21_paid = EXCLUDED.total_pph21_paid,
    total_pph23_withheld = EXCLUDED.total_pph23_withheld,
    total_net_income = EXCLUDED.total_net_income,
    invoice_count = EXCLUDED.invoice_count,
    invoice_ids = EXCLUDED.invoice_ids,
    calculated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
