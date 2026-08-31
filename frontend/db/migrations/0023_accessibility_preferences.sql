-- Per-user, per-device-category accessibility preferences (typography of the
-- reading iframe and of the portal chrome — see frontend/lib/readingPrefs.ts
-- and frontend/lib/portalTypography.ts), synced across a user's devices.
--
-- "device_category" is derived server-side from the request's User-Agent
-- (frontend/lib/deviceCategory.ts) and never accepted from the client: every
-- mobile device of a user shares one row, every non-mobile device shares the
-- other. A user has at most 2 rows (one per category).
--
-- Absence of a row means "nothing synced yet for this category" — the client
-- seeds the row from its own localStorage value on first sync instead of
-- this migration inventing a default (see AccessibilityPreferencesSync.tsx).
CREATE TABLE IF NOT EXISTS public.accessibility_preferences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  device_category   TEXT NOT NULL CHECK (device_category IN ('mobile', 'non_mobile')),
  preferences       JSONB NOT NULL DEFAULT '{}',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, device_category)
);
