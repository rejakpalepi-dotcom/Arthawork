-- =====================================================
-- Contracts and Smart Contract System
-- Created: 2026-01-03
-- =====================================================

-- =====================================================
-- 1. CONTRACTS TABLE
-- Stores contract/agreement information with digital signature
-- =====================================================
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  -- Contract details
  title TEXT NOT NULL,
  description TEXT,
  scope_of_work JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  dp_percentage INTEGER NOT NULL DEFAULT 50,
  dp_amount NUMERIC NOT NULL DEFAULT 0,
  
  -- Contract token for public access
  contract_token UUID DEFAULT gen_random_uuid() UNIQUE,
  
  -- Status: draft, sent, signed, paid, active, completed, cancelled
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'paid', 'active', 'completed', 'cancelled')),
  
  -- Signature fields
  client_signature_name TEXT,
  client_signature_date TIMESTAMP WITH TIME ZONE,
  client_ip_address INET,
  signature_hash TEXT,
  
  -- Payment tracking
  payment_due_date DATE,
  mayar_payment_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'expired')),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 2. ADD CONTRACT REFERENCE TO PROPOSALS
-- =====================================================
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS converted_to_contract_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own contracts
CREATE POLICY "Users can manage their own contracts"
  ON public.contracts FOR ALL
  USING (auth.uid() = user_id);

-- Public can view contracts by token (for client signing)
CREATE POLICY "Public can view contracts by token"
  ON public.contracts FOR SELECT
  USING (contract_token IS NOT NULL);

-- =====================================================
-- 4. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_token ON public.contracts(contract_token);
CREATE INDEX IF NOT EXISTS idx_proposals_contract_id ON public.proposals(contract_id);

-- =====================================================
-- 5. TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_updated_at();

-- =====================================================
-- 6. FUNCTION TO CALCULATE DP AMOUNT
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_dp_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.dp_amount = NEW.total_amount * (NEW.dp_percentage::NUMERIC / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_dp_before_insert_or_update
  BEFORE INSERT OR UPDATE OF total_amount, dp_percentage ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION calculate_dp_amount();
