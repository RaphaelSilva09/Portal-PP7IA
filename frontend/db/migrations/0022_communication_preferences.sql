-- Per-user, per-communication-type opt-in/opt-out with an auditable trail.
--
-- Source of truth for whether a user receives a given kind of email
-- (initially only 'weekly_news', the "Novidades da semana" digest — see
-- frontend/lib/email/weekly-digest.ts and docs/setup/WEEKLY_NEWS_UNSUBSCRIBE.md).
-- Deliberately independent of the legacy "user"."accept_email_updates" /
-- "accept_whatsapp_updates" flags, which stay as-is for their existing
-- WhatsApp-coupled consent flow and are not touched by this migration.
--
-- Absence of a row for (user_id, communication_type) means "not subscribed" —
-- rows are only created when a user has actually subscribed, unsubscribed, or
-- was migrated from prior evidence of consent. This keeps the table free of
-- placeholder negative rows for the (majority) never-interacted-with case.
CREATE TABLE IF NOT EXISTS public.communication_preferences (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  communication_type  TEXT NOT NULL CHECK (communication_type IN ('weekly_news')),
  enabled             BOOLEAN NOT NULL,
  subscribed_at       TIMESTAMPTZ,
  unsubscribed_at     TIMESTAMPTZ,
  last_changed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  source              TEXT NOT NULL CHECK (source IN ('profile', 'email_body', 'email_header', 'legacy_signup_migration')),
  UNIQUE (user_id, communication_type)
);

CREATE INDEX IF NOT EXISTS idx_communication_preferences_lookup
  ON public.communication_preferences(communication_type, enabled)
  WHERE enabled = true;

-- Backfill: users who explicitly opted into "accept_email_updates" at signup
-- (an unchecked-by-default checkbox — see frontend/components/AuthModal.tsx)
-- have real evidence of prior consent for marketing-style email. Migrate only
-- those users as subscribed to weekly_news; everyone else starts unsubscribed
-- (i.e. no row). Email verification is NOT used as a consent signal here —
-- it only gates send-time eligibility in the job's recipient query.
--
-- The original consent timestamp was never recorded, so subscribed_at is left
-- NULL rather than invented; last_changed_at records when this migration ran.
INSERT INTO public.communication_preferences
  (user_id, communication_type, enabled, subscribed_at, unsubscribed_at, last_changed_at, source)
SELECT
  id,
  'weekly_news',
  true,
  NULL,
  NULL,
  now(),
  'legacy_signup_migration'
FROM "user"
WHERE accept_email_updates = true
ON CONFLICT (user_id, communication_type) DO NOTHING;
