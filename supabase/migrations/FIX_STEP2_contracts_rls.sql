-- =====================================================
-- STEP 2: Enable RLS and create policies
-- Run this AFTER Step 1 succeeds
-- =====================================================

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Users can manage their own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Public can view contracts by token" ON public.contracts;

-- Create policies
CREATE POLICY "Users can manage their own contracts"
  ON public.contracts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view contracts by token"
  ON public.contracts FOR SELECT
  USING (contract_token IS NOT NULL);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_token ON public.contracts(contract_token);
