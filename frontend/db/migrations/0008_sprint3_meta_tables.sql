-- Sprint 3 meta tables: home_block_descriptions + mini_livro_section_meta.
-- These were created ad-hoc no banco (no migration file shipped) and the
-- frontend hooks already query them. Define schemas idempotently so Railway
-- dev gets the tables and bancos restaurados stay no-op.

CREATE TABLE IF NOT EXISTS public.home_block_descriptions (
  slug TEXT PRIMARY KEY,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger tg
    JOIN pg_class tbl ON tbl.oid = tg.tgrelid
    JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
    WHERE tg.tgname = 'trg_home_block_descriptions_set_updated_at'
      AND ns.nspname = 'public'
      AND tbl.relname = 'home_block_descriptions'
      AND NOT tg.tgisinternal
  ) THEN
    CREATE TRIGGER trg_home_block_descriptions_set_updated_at
      BEFORE UPDATE ON public.home_block_descriptions
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.mini_livro_section_meta (
  kind TEXT PRIMARY KEY CHECK (kind IN ('introducao', 'encerramento')),
  title TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger tg
    JOIN pg_class tbl ON tbl.oid = tg.tgrelid
    JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
    WHERE tg.tgname = 'trg_mini_livro_section_meta_set_updated_at'
      AND ns.nspname = 'public'
      AND tbl.relname = 'mini_livro_section_meta'
      AND NOT tg.tgisinternal
  ) THEN
    CREATE TRIGGER trg_mini_livro_section_meta_set_updated_at
      BEFORE UPDATE ON public.mini_livro_section_meta
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END
$$;
