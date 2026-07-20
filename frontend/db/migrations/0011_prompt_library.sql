-- Biblioteca de prompts prontos para as 7 IAs do portal (PDF 5.4 "novas propostas").
-- Corpo do prompt pode ser restrito a leitores cadastrados (is_gated).

CREATE TABLE IF NOT EXISTS public.prompt_library (
  id           SERIAL PRIMARY KEY,
  ai_tool      TEXT NOT NULL,
  title        TEXT NOT NULL,
  prompt_body  TEXT NOT NULL,
  use_case     TEXT NOT NULL DEFAULT '',
  is_gated     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger tg
    JOIN pg_class tbl ON tbl.oid = tg.tgrelid
    JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
    WHERE tg.tgname = 'trg_prompt_library_set_updated_at'
      AND ns.nspname = 'public'
      AND tbl.relname = 'prompt_library'
      AND NOT tg.tgisinternal
  ) THEN
    CREATE TRIGGER trg_prompt_library_set_updated_at
      BEFORE UPDATE ON public.prompt_library
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END
$$;
