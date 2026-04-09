-- Artha Product Review: Status System Timestamps Migration
-- Add timestamp columns for real status tracking

-- Invoice timestamps
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ DEFAULT NULL;

-- Proposal timestamps
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL;

-- Backfill existing data: set paid_at for already-paid invoices
UPDATE invoices SET paid_at = updated_at WHERE status = 'paid' AND paid_at IS NULL;

-- Backfill: set sent_at for already-sent invoices/proposals
UPDATE invoices SET sent_at = updated_at WHERE status = 'sent' AND sent_at IS NULL;
UPDATE proposals SET sent_at = updated_at WHERE status = 'sent' AND sent_at IS NULL;
UPDATE proposals SET approved_at = updated_at WHERE status = 'approved' AND approved_at IS NULL;
