-- Editorial — singleton table for the rich-text editor flow (legacy design).
-- Idempotent: safe to run after a Postgres dump + restore that already
-- created the table. RLS grants stripped — auth is enforced at
-- the HTTP route layer via better-auth.

CREATE TABLE IF NOT EXISTS public.editorial (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT editorial_single_row CHECK (id = 1)
);

INSERT INTO public.editorial (id, content)
VALUES (1, '')
ON CONFLICT (id) DO NOTHING;
