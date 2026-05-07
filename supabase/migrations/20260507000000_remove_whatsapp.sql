-- Migrate users who had only WhatsApp consent to email consent
UPDATE public.users
SET accept_email_updates = true
WHERE accept_whatsapp_updates = true
  AND accept_email_updates = false;

-- Drop old constraint (required at least one of email OR whatsapp)
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_consent_check;

-- New constraint: email is mandatory
ALTER TABLE public.users
  ADD CONSTRAINT users_consent_check CHECK (accept_email_updates = true);

-- Remove WhatsApp column
ALTER TABLE public.users
  DROP COLUMN IF EXISTS accept_whatsapp_updates;

-- Recreate trigger without WhatsApp field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, celular, accept_email_updates)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'celular', ''),
    COALESCE((NEW.raw_user_meta_data->>'accept_email_updates')::boolean, true)
  );
  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
  RETURN NEW;
END;
$$;
