-- Access rules that lock individual content items (any content_type/slug
-- pair) behind a condition — evaluated server-side before the HTML is served
-- (frontend/app/api/proxy-html/[type]/[slug]/route.ts) and before PDF export
-- (frontend/app/api/export-pdf/[type]/[slug]/route.ts), not just hidden on
-- the client.
--
-- rule_type is a discriminator resolved against a Strategy registry
-- (frontend/domain/access-rules/registry.ts) — adding a new kind of lock is
-- a new strategy file + one registration, not a change to this table or to
-- any of the enforcement points above.
--
-- Same identification convention as saved_content: content_type + slug (the
-- public "/view/{type}/{slug}" segment), not each content table's own
-- numeric id — content lives in separate tables per type, this is the one
-- identifier available both where the rule is configured (admin) and where
-- it's enforced (the public view/proxy routes).
--
-- Absence of a row means "not locked" — this is the common case, so rows are
-- only created when a piece of content is actually restricted.
CREATE TABLE IF NOT EXISTS public.content_access_rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type  TEXT NOT NULL,
  slug          TEXT NOT NULL,
  rule_type     TEXT NOT NULL,
  params        JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (content_type, slug)
);
