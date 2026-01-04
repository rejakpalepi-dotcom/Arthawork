-- Fix Security Advisor Warnings
-- 1. Fix Function Search Path Mutable for subscription functions

-- Fix update_subscription function
CREATE OR REPLACE FUNCTION public.update_subscription_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- Fixed: explicit search path
AS $$
BEGIN
  -- Update usage counts when invoices or proposals are created
  IF TG_TABLE_NAME = 'invoices' THEN
    UPDATE public.subscriptions
    SET invoices_this_month = invoices_this_month + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSIF TG_TABLE_NAME = 'proposals' THEN
    UPDATE public.subscriptions
    SET proposals_this_month = proposals_this_month + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix create_default_subscription function
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- Fixed: explicit search path
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Also fix the generate_recurring_invoice function if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'generate_recurring_invoice'
  ) THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION public.generate_recurring_invoice(template_id uuid)
      RETURNS uuid
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = ''''
      AS $func$
      DECLARE
        v_template public.recurring_templates%ROWTYPE;
        v_invoice_id uuid;
        v_invoice_number text;
        v_subtotal decimal;
        v_tax_amount decimal;
        v_total decimal;
        v_item jsonb;
      BEGIN
        SELECT * INTO v_template FROM public.recurring_templates WHERE id = template_id;
        
        IF NOT FOUND THEN
          RAISE EXCEPTION ''Template not found'';
        END IF;
        
        SELECT ''INV-'' || TO_CHAR(NOW(), ''YYYYMMDD'') || ''-'' || LPAD((COUNT(*) + 1)::text, 4, ''0'')
        INTO v_invoice_number
        FROM public.invoices WHERE user_id = v_template.user_id;
        
        SELECT COALESCE(SUM((item->>''total'')::decimal), 0)
        INTO v_subtotal
        FROM jsonb_array_elements(v_template.items) AS item;
        
        v_tax_amount := v_subtotal * (v_template.tax_rate / 100);
        v_total := v_subtotal + v_tax_amount;
        
        INSERT INTO public.invoices (
          user_id, client_id, invoice_number, status, issue_date, due_date,
          subtotal, tax_rate, tax_amount, total, notes, is_recurring, recurring_parent_id
        )
        VALUES (
          v_template.user_id, v_template.client_id, v_invoice_number, ''draft'',
          CURRENT_DATE, CURRENT_DATE + INTERVAL ''30 days'',
          v_subtotal, v_template.tax_rate, v_tax_amount, v_total,
          v_template.notes, false, template_id
        )
        RETURNING id INTO v_invoice_id;
        
        FOR v_item IN SELECT * FROM jsonb_array_elements(v_template.items)
        LOOP
          INSERT INTO public.invoice_items (invoice_id, description, quantity, unit_price, total)
          VALUES (
            v_invoice_id, v_item->>''description'', (v_item->>''quantity'')::decimal,
            (v_item->>''unit_price'')::decimal, (v_item->>''total'')::decimal
          );
        END LOOP;
        
        UPDATE public.recurring_templates
        SET next_run = CASE interval
          WHEN ''weekly'' THEN next_run + INTERVAL ''7 days''
          WHEN ''biweekly'' THEN next_run + INTERVAL ''14 days''
          WHEN ''monthly'' THEN next_run + INTERVAL ''1 month''
          WHEN ''quarterly'' THEN next_run + INTERVAL ''3 months''
          WHEN ''yearly'' THEN next_run + INTERVAL ''1 year''
        END, updated_at = NOW()
        WHERE id = template_id;
        
        UPDATE public.recurring_templates
        SET is_active = false
        WHERE id = template_id AND end_date IS NOT NULL AND next_run > end_date;
        
        RETURN v_invoice_id;
      END;
      $func$;
    ';
  END IF;
END;
$$;

-- Fix process_recurring_invoices function if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'process_recurring_invoices'
  ) THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION public.process_recurring_invoices()
      RETURNS integer
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = ''''
      AS $func$
      DECLARE
        v_template RECORD;
        v_count integer := 0;
      BEGIN
        FOR v_template IN 
          SELECT id FROM public.recurring_templates 
          WHERE is_active = true AND next_run <= CURRENT_DATE
        LOOP
          PERFORM public.generate_recurring_invoice(v_template.id);
          v_count := v_count + 1;
        END LOOP;
        
        RETURN v_count;
      END;
      $func$;
    ';
  END IF;
END;
$$;

-- Fix log_audit_action function if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'log_audit_action'
  ) THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION public.log_audit_action()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = ''''
      AS $func$
      BEGIN
        INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, metadata)
        VALUES (
          auth.uid(),
          TG_ARGV[0],
          TG_TABLE_NAME,
          CASE 
            WHEN TG_OP = ''DELETE'' THEN OLD.id
            ELSE NEW.id
          END,
          CASE 
            WHEN TG_OP = ''DELETE'' THEN to_jsonb(OLD)
            WHEN TG_OP = ''UPDATE'' THEN jsonb_build_object(''old'', to_jsonb(OLD), ''new'', to_jsonb(NEW))
            ELSE to_jsonb(NEW)
          END
        );
        RETURN NULL;
      END;
      $func$;
    ';
  END IF;
END;
$$;
