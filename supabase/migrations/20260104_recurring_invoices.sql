-- Recurring Invoices System
-- Automatically generates invoices based on schedule

-- Add recurring invoice fields to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurrence_interval text; -- 'weekly', 'monthly', 'quarterly', 'yearly'
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS next_invoice_date date;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurring_parent_id uuid REFERENCES invoices(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurrence_count integer DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurrence_end_date date; -- Optional end date

-- Create recurring templates table for easier management
CREATE TABLE IF NOT EXISTS recurring_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  interval text NOT NULL CHECK (interval IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  day_of_month integer CHECK (day_of_month >= 1 AND day_of_month <= 28),
  next_run date NOT NULL,
  end_date date,
  is_active boolean DEFAULT true,
  items jsonb NOT NULL DEFAULT '[]', -- Invoice line items as JSON
  tax_rate decimal(5,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for recurring_templates
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recurring templates"
  ON recurring_templates FOR ALL
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_recurring_templates_user ON recurring_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_next_run ON recurring_templates(next_run) WHERE is_active = true;

-- Function to generate invoice from recurring template
CREATE OR REPLACE FUNCTION generate_recurring_invoice(template_id uuid)
RETURNS uuid AS $$
DECLARE
  v_template recurring_templates%ROWTYPE;
  v_invoice_id uuid;
  v_invoice_number text;
  v_subtotal decimal;
  v_tax_amount decimal;
  v_total decimal;
  v_item jsonb;
BEGIN
  -- Get template
  SELECT * INTO v_template FROM recurring_templates WHERE id = template_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found';
  END IF;
  
  -- Generate invoice number
  SELECT 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((COUNT(*) + 1)::text, 4, '0')
  INTO v_invoice_number
  FROM invoices WHERE user_id = v_template.user_id;
  
  -- Calculate totals from items JSON
  SELECT COALESCE(SUM((item->>'total')::decimal), 0)
  INTO v_subtotal
  FROM jsonb_array_elements(v_template.items) AS item;
  
  v_tax_amount := v_subtotal * (v_template.tax_rate / 100);
  v_total := v_subtotal + v_tax_amount;
  
  -- Create invoice
  INSERT INTO invoices (
    user_id, client_id, invoice_number, status, issue_date, due_date,
    subtotal, tax_rate, tax_amount, total, notes, is_recurring, recurring_parent_id
  )
  VALUES (
    v_template.user_id,
    v_template.client_id,
    v_invoice_number,
    'draft',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    v_subtotal,
    v_template.tax_rate,
    v_tax_amount,
    v_total,
    v_template.notes,
    false,
    template_id
  )
  RETURNING id INTO v_invoice_id;
  
  -- Create invoice items
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_template.items)
  LOOP
    INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
    VALUES (
      v_invoice_id,
      v_item->>'description',
      (v_item->>'quantity')::decimal,
      (v_item->>'unit_price')::decimal,
      (v_item->>'total')::decimal
    );
  END LOOP;
  
  -- Update next run date based on interval
  UPDATE recurring_templates
  SET next_run = CASE interval
    WHEN 'weekly' THEN next_run + INTERVAL '7 days'
    WHEN 'biweekly' THEN next_run + INTERVAL '14 days'
    WHEN 'monthly' THEN next_run + INTERVAL '1 month'
    WHEN 'quarterly' THEN next_run + INTERVAL '3 months'
    WHEN 'yearly' THEN next_run + INTERVAL '1 year'
  END,
  updated_at = NOW()
  WHERE id = template_id;
  
  -- Deactivate if past end date
  UPDATE recurring_templates
  SET is_active = false
  WHERE id = template_id AND end_date IS NOT NULL AND next_run > end_date;
  
  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process all due recurring invoices (called by cron)
CREATE OR REPLACE FUNCTION process_recurring_invoices()
RETURNS integer AS $$
DECLARE
  v_template RECORD;
  v_count integer := 0;
BEGIN
  FOR v_template IN 
    SELECT id FROM recurring_templates 
    WHERE is_active = true AND next_run <= CURRENT_DATE
  LOOP
    PERFORM generate_recurring_invoice(v_template.id);
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON recurring_templates TO authenticated;

-- Note: To enable automatic processing, run this in Supabase Dashboard:
-- SELECT cron.schedule(
--   'process-recurring-invoices',
--   '0 1 * * *',  -- Run daily at 1 AM UTC
--   $$SELECT process_recurring_invoices()$$
-- );
