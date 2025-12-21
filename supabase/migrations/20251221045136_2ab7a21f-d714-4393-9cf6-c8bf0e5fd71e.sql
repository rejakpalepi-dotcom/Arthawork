-- 1. Add DELETE policy to business_settings for complete CRUD protection
CREATE POLICY "Users can delete their own settings"
ON public.business_settings
FOR DELETE
USING (auth.uid() = user_id);

-- 2. Add DELETE policy to profiles for GDPR compliance
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- 3. Create a secure function to fetch guest invoice data without exposing sensitive client info
CREATE OR REPLACE FUNCTION public.get_guest_invoice_by_token(p_token uuid)
RETURNS TABLE (
  id uuid,
  invoice_number text,
  status text,
  issue_date date,
  due_date date,
  subtotal numeric,
  tax_rate numeric,
  tax_amount numeric,
  total numeric,
  notes text,
  client_name text,
  client_company text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    i.id,
    i.invoice_number,
    i.status,
    i.issue_date,
    i.due_date,
    i.subtotal,
    i.tax_rate,
    i.tax_amount,
    i.total,
    i.notes,
    c.name as client_name,
    c.company as client_company
  FROM public.invoices i
  LEFT JOIN public.clients c ON i.client_id = c.id
  WHERE i.payment_token = p_token
  LIMIT 1;
$$;

-- 4. Create a secure function to fetch invoice items for guest access
CREATE OR REPLACE FUNCTION public.get_guest_invoice_items(p_invoice_id uuid, p_token uuid)
RETURNS TABLE (
  id uuid,
  description text,
  quantity numeric,
  unit_price numeric,
  total numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ii.id,
    ii.description,
    ii.quantity,
    ii.unit_price,
    ii.total
  FROM public.invoice_items ii
  INNER JOIN public.invoices i ON ii.invoice_id = i.id
  WHERE ii.invoice_id = p_invoice_id
    AND i.payment_token = p_token;
$$;

-- 5. Create a secure function to get payment bank details for guest checkout
CREATE OR REPLACE FUNCTION public.get_business_payment_info_by_token(p_token uuid)
RETURNS TABLE (
  bank_name text,
  account_name text,
  account_number text,
  payment_notes text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    bs.bank_name,
    bs.account_name,
    bs.account_number,
    bs.payment_notes
  FROM public.business_settings bs
  INNER JOIN public.invoices i ON bs.user_id = i.user_id
  WHERE i.payment_token = p_token
  LIMIT 1;
$$;