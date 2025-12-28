-- Performance Indexes for 1000+ User Scale
-- Created: 2025-12-28
-- Purpose: Add indexes on frequently queried columns for query optimization

-- Invoices table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_user_id 
  ON public.invoices(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_created_at 
  ON public.invoices(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_status 
  ON public.invoices(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_user_status 
  ON public.invoices(user_id, status);

-- Proposals table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_user_id 
  ON public.proposals(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_created_at 
  ON public.proposals(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_status 
  ON public.proposals(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_user_status 
  ON public.proposals(user_id, status);

-- Clients table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_user_id 
  ON public.clients(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_created_at 
  ON public.clients(created_at DESC);

-- Services table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_user_id 
  ON public.services(user_id);

-- Invoice items index for faster joins
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_items_invoice_id 
  ON public.invoice_items(invoice_id);

-- Business settings index (unique constraint already creates index, but adding for clarity)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_settings_user_id 
  ON public.business_settings(user_id);
