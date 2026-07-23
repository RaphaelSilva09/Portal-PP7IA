-- mini_livro_sections — per-volume intro/outro sections.
-- Idempotent. RLS grants stripped (auth at route layer).
--
-- NOTE: original migration constrained kind to ('prefacio','encerramento'),
-- but the application code uses ('introducao','encerramento'). The CHECK below
-- accepts all three to remain compatible w/ pg_dump'd prod data while the
-- frontend reads/writes 'introducao'. A follow-up cleanup migration should
-- rename 'prefacio' → 'introducao' in any existing rows once verified.

CREATE TABLE IF NOT EXISTS public.mini_livro_sections (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('prefacio', 'introducao', 'encerramento')),
  title TEXT NOT NULL,
  description TEXT,
  html_path TEXT,
  "index" INTEGER NOT NULL DEFAULT 0 CHECK ("index" >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mini_livro_sections_kind_index
  ON public.mini_livro_sections (kind, "index");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger tg
    JOIN pg_class tbl ON tbl.oid = tg.tgrelid
    JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
    WHERE tg.tgname = 'trg_mini_livro_sections_set_updated_at'
      AND ns.nspname = 'public'
      AND tbl.relname = 'mini_livro_sections'
      AND NOT tg.tgisinternal
  ) THEN
    CREATE TRIGGER trg_mini_livro_sections_set_updated_at
      BEFORE UPDATE ON public.mini_livro_sections
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END
$$;
