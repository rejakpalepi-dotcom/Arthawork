-- Drop the overly permissive public policy on invoices
DROP POLICY IF EXISTS "Public can view limited invoice data by payment token" ON public.invoices;

-- Create a restrictive policy that only allows viewing specific columns
-- Note: RLS policies cannot limit columns, so we use the existing security definer function
-- The get_public_invoice_by_token function already restricts to safe columns
-- We need to restrict the direct table policy more tightly

-- For direct table access, only allow authenticated users who own the invoice
-- Public access should go through the security definer function only
CREATE POLICY "Public can only access invoices via secure function"
ON public.invoices
FOR SELECT
TO anon
USING (false);

-- The existing function get_public_invoice_by_token is the proper way to access public invoice data
-- It already restricts to: invoice_number, total, status, due_date, issue_date

-- Ensure the existing granular policies for authenticated users are in place
-- (These already exist from the previous migration)