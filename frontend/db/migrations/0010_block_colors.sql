-- Configuração de cores dos blocos editoriais: singleton (id = 1).
-- Cada cor é um hex string (#rrggbb). Criado na primeira leitura caso não exista.

CREATE TABLE IF NOT EXISTS public.block_colors (
  id      INTEGER PRIMARY KEY DEFAULT 1,
  colors  JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger tg
    JOIN pg_class tbl ON tbl.oid = tg.tgrelid
    JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
    WHERE tg.tgname = 'trg_block_colors_set_updated_at'
      AND ns.nspname = 'public'
      AND tbl.relname = 'block_colors'
      AND NOT tg.tgisinternal
  ) THEN
    CREATE TRIGGER trg_block_colors_set_updated_at
      BEFORE UPDATE ON public.block_colors
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END
$$;
