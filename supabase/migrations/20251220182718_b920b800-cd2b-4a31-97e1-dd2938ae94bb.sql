-- Add RLS policy for public invoice_items access via payment_token
-- This allows anonymous users to view items ONLY for invoices with a valid payment_token

-- First, create a security definer function to check if invoice has valid payment_token
CREATE OR REPLACE FUNCTION public.invoice_has_payment_token(invoice_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.invoices
    WHERE id = invoice_uuid
      AND payment_token IS NOT NULL
  );
$$;

-- Add policy for anonymous access to invoice_items via payment_token
CREATE POLICY "Public can view invoice items with valid payment token"
ON public.invoice_items
FOR SELECT
TO anon
USING (public.invoice_has_payment_token(invoice_id));

-- Create trigger function to enforce user_id immutability on clients table
CREATE OR REPLACE FUNCTION public.enforce_client_user_id_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On INSERT, ensure user_id matches auth.uid()
  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id != auth.uid() THEN
      RAISE EXCEPTION 'user_id must match the authenticated user';
    END IF;
  END IF;
  
  -- On UPDATE, prevent user_id from being changed
  IF TG_OP = 'UPDATE' THEN
    IF OLD.user_id != NEW.user_id THEN
      RAISE EXCEPTION 'user_id cannot be modified after creation';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on clients table
DROP TRIGGER IF EXISTS enforce_client_user_id ON public.clients;
CREATE TRIGGER enforce_client_user_id
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_client_user_id_immutability();

-- Add comment documenting the payment_token public access pattern
COMMENT ON COLUMN public.invoices.payment_token IS 'UUID v4 token for secure public invoice access. Used by get_public_invoice_by_token function to allow anonymous users to view limited invoice details without authentication. Token is auto-generated on invoice creation.';