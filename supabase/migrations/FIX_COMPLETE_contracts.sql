-- =====================================================
-- COMPLETE FIX: Drop and recreate contracts table
-- Run this if you're getting "user_id does not exist" error
-- =====================================================

-- First, drop the table if it exists (this removes any broken table)
DROP TABLE IF EXISTS public.contracts CASCADE;

-- Now create the table fresh
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  scope_of_work JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  dp_percentage INTEGER NOT NULL DEFAULT 50,
  dp_amount NUMERIC NOT NULL DEFAULT 0,
  
  contract_token UUID DEFAULT gen_random_uuid() UNIQUE,
  
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'paid', 'active', 'completed', 'cancelled')),
  
  client_signature_name TEXT,
  client_signature_date TIMESTAMP WITH TIME ZONE,
  client_ip_address INET,
  signature_hash TEXT,
  
  payment_due_date DATE,
  mayar_payment_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'expired')),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own contracts"
  ON public.contracts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view contracts by token"
  ON public.contracts FOR SELECT
  USING (contract_token IS NOT NULL);

-- Create indexes
CREATE INDEX idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_token ON public.contracts(contract_token);
