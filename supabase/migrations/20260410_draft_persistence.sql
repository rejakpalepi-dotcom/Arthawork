-- Phase 1: Draft Persistence
-- Add JSONB columns for full editor state storage
-- Normalized fields (title, total, status, client_id, updated_at) remain for list views

-- Invoice full draft data
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_data JSONB DEFAULT NULL;

-- Proposal full draft data
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS proposal_data JSONB DEFAULT NULL;
