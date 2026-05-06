-- Auto-runs once on first boot when data dir is empty.
-- Postgres 16 has gen_random_uuid() in core — no pgcrypto needed for that.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- fuzzy search on text fields
CREATE EXTENSION IF NOT EXISTS unaccent;    -- accent-insensitive text match (PT-BR friendly)

-- Sanity: log versions to startup output
DO $$
BEGIN
  RAISE NOTICE 'pgvector version: %', (SELECT extversion FROM pg_extension WHERE extname='vector');
  RAISE NOTICE 'pg_trgm version: %',  (SELECT extversion FROM pg_extension WHERE extname='pg_trgm');
  RAISE NOTICE 'unaccent version: %', (SELECT extversion FROM pg_extension WHERE extname='unaccent');
END $$;
