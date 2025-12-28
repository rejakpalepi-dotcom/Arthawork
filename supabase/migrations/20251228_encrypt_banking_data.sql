-- Security Hardening Migration: Database Encryption for Banking Data
-- Created: 2025-12-28
-- Purpose: Encrypt sensitive banking information using pgcrypto

-- 1. Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Add encrypted columns for banking data
ALTER TABLE public.business_settings 
  ADD COLUMN IF NOT EXISTS account_number_encrypted BYTEA,
  ADD COLUMN IF NOT EXISTS routing_number_encrypted BYTEA;

-- 3. Create encryption helper function (SECURITY DEFINER to protect key)
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(
  plaintext TEXT,
  encryption_key TEXT
)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF plaintext IS NULL OR plaintext = '' THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_encrypt(plaintext, encryption_key);
END;
$$;

-- 4. Create decryption helper function (SECURITY DEFINER to protect key)
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(
  ciphertext BYTEA,
  encryption_key TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF ciphertext IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_decrypt(ciphertext, encryption_key);
EXCEPTION
  WHEN OTHERS THEN
    -- Return NULL if decryption fails (wrong key, corrupted data)
    RETURN NULL;
END;
$$;

-- 5. Create a secure function to upsert business settings with encryption
CREATE OR REPLACE FUNCTION public.upsert_business_settings(
  p_user_id UUID,
  p_business_name TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_logo_url TEXT DEFAULT NULL,
  p_primary_color TEXT DEFAULT NULL,
  p_accent_color TEXT DEFAULT NULL,
  p_tagline TEXT DEFAULT NULL,
  p_bank_name TEXT DEFAULT NULL,
  p_account_name TEXT DEFAULT NULL,
  p_account_number TEXT DEFAULT NULL,
  p_routing_number TEXT DEFAULT NULL,
  p_payment_notes TEXT DEFAULT NULL,
  p_encryption_key TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_account_encrypted BYTEA;
  v_routing_encrypted BYTEA;
BEGIN
  -- Verify the caller is the owner
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: user_id mismatch';
  END IF;

  -- Encrypt sensitive data if key is provided
  IF p_encryption_key IS NOT NULL AND p_encryption_key != '' THEN
    v_account_encrypted := public.encrypt_sensitive_data(p_account_number, p_encryption_key);
    v_routing_encrypted := public.encrypt_sensitive_data(p_routing_number, p_encryption_key);
  END IF;

  INSERT INTO public.business_settings (
    user_id, business_name, email, phone, website, address,
    logo_url, primary_color, accent_color, tagline,
    bank_name, account_name, account_number, routing_number,
    account_number_encrypted, routing_number_encrypted, payment_notes
  )
  VALUES (
    p_user_id, p_business_name, p_email, p_phone, p_website, p_address,
    p_logo_url, p_primary_color, p_accent_color, p_tagline,
    p_bank_name, p_account_name,
    CASE WHEN p_encryption_key IS NOT NULL THEN NULL ELSE p_account_number END,
    CASE WHEN p_encryption_key IS NOT NULL THEN NULL ELSE p_routing_number END,
    v_account_encrypted, v_routing_encrypted, p_payment_notes
  )
  ON CONFLICT (user_id) DO UPDATE SET
    business_name = COALESCE(EXCLUDED.business_name, business_settings.business_name),
    email = COALESCE(EXCLUDED.email, business_settings.email),
    phone = COALESCE(EXCLUDED.phone, business_settings.phone),
    website = COALESCE(EXCLUDED.website, business_settings.website),
    address = COALESCE(EXCLUDED.address, business_settings.address),
    logo_url = COALESCE(EXCLUDED.logo_url, business_settings.logo_url),
    primary_color = COALESCE(EXCLUDED.primary_color, business_settings.primary_color),
    accent_color = COALESCE(EXCLUDED.accent_color, business_settings.accent_color),
    tagline = COALESCE(EXCLUDED.tagline, business_settings.tagline),
    bank_name = COALESCE(EXCLUDED.bank_name, business_settings.bank_name),
    account_name = COALESCE(EXCLUDED.account_name, business_settings.account_name),
    account_number = CASE WHEN p_encryption_key IS NOT NULL THEN NULL ELSE COALESCE(EXCLUDED.account_number, business_settings.account_number) END,
    routing_number = CASE WHEN p_encryption_key IS NOT NULL THEN NULL ELSE COALESCE(EXCLUDED.routing_number, business_settings.routing_number) END,
    account_number_encrypted = COALESCE(v_account_encrypted, business_settings.account_number_encrypted),
    routing_number_encrypted = COALESCE(v_routing_encrypted, business_settings.routing_number_encrypted),
    payment_notes = COALESCE(EXCLUDED.payment_notes, business_settings.payment_notes),
    updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- 6. Create a secure function to get decrypted business settings
CREATE OR REPLACE FUNCTION public.get_business_settings_decrypted(
  p_user_id UUID,
  p_encryption_key TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  business_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  logo_url TEXT,
  primary_color TEXT,
  accent_color TEXT,
  tagline TEXT,
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  payment_notes TEXT,
  stripe_connected BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is the owner
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: user_id mismatch';
  END IF;

  RETURN QUERY
  SELECT 
    bs.id,
    bs.user_id,
    bs.business_name,
    bs.email,
    bs.phone,
    bs.website,
    bs.address,
    bs.logo_url,
    bs.primary_color,
    bs.accent_color,
    bs.tagline,
    bs.bank_name,
    bs.account_name,
    -- Prefer decrypted value, fallback to plaintext for backward compatibility
    COALESCE(
      public.decrypt_sensitive_data(bs.account_number_encrypted, p_encryption_key),
      bs.account_number
    ) AS account_number,
    COALESCE(
      public.decrypt_sensitive_data(bs.routing_number_encrypted, p_encryption_key),
      bs.routing_number
    ) AS routing_number,
    bs.payment_notes,
    bs.stripe_connected,
    bs.created_at,
    bs.updated_at
  FROM public.business_settings bs
  WHERE bs.user_id = p_user_id;
END;
$$;

-- 7. Comment on sensitive columns
COMMENT ON COLUMN public.business_settings.account_number IS 'DEPRECATED: Use account_number_encrypted for new data';
COMMENT ON COLUMN public.business_settings.routing_number IS 'DEPRECATED: Use routing_number_encrypted for new data';
COMMENT ON COLUMN public.business_settings.account_number_encrypted IS 'Encrypted account number using pgcrypto pgp_sym_encrypt';
COMMENT ON COLUMN public.business_settings.routing_number_encrypted IS 'Encrypted routing number using pgcrypto pgp_sym_encrypt';
