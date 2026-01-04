-- =====================================================
-- COMPLETE FIX: Drop and recreate tax_summary table
-- =====================================================

-- First, drop the table if it exists
DROP TABLE IF EXISTS public.tax_summary CASCADE;

-- Add columns to invoices table (these will be skipped if they exist)
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS tax_type TEXT CHECK (tax_type IN ('pph21', 'pph23', 'none')),
  ADD COLUMN IF NOT EXISTS tax_mode TEXT CHECK (tax_mode IN ('include', 'exclude')) DEFAULT 'exclude',
  ADD COLUMN IF NOT EXISTS client_has_npwp BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS client_npwp_number TEXT,
  ADD COLUMN IF NOT EXISTS pph_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pph_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_amount NUMERIC;

-- Add columns to clients table
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS npwp_number TEXT,
  ADD COLUMN IF NOT EXISTS client_type TEXT CHECK (client_type IN ('individual', 'corporate')) DEFAULT 'individual';

-- Now create the tax_summary table fresh
CREATE TABLE public.tax_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  tax_year INTEGER NOT NULL,
  tax_month INTEGER,
  
  total_gross_income NUMERIC DEFAULT 0,
  total_pph21_paid NUMERIC DEFAULT 0,
  total_pph23_withheld NUMERIC DEFAULT 0,
  total_net_income NUMERIC DEFAULT 0,
  
  invoice_count INTEGER DEFAULT 0,
  invoice_ids UUID[] DEFAULT '{}',
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT tax_summary_user_period_unique UNIQUE (user_id, tax_year, tax_month)
);

-- Enable RLS
ALTER TABLE public.tax_summary ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage their own tax summaries"
  ON public.tax_summary FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tax_summary_user_year ON public.tax_summary(user_id, tax_year);
