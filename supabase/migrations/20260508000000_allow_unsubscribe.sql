-- Allow users to unsubscribe from email updates.
-- The previous migration added CHECK (accept_email_updates = true), which blocks the
-- /preferencias unsubscribe route from setting the field to false.
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_consent_check;
