-- Configuração da página principal: ordem das seções e textos editáveis.
-- Singleton (id = 1). Criado na primeira leitura caso não exista.

CREATE TABLE IF NOT EXISTS public.homepage_config (
  id      INTEGER PRIMARY KEY DEFAULT 1,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger tg
    JOIN pg_class tbl ON tbl.oid = tg.tgrelid
    JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
    WHERE tg.tgname = 'trg_homepage_config_set_updated_at'
      AND ns.nspname = 'public'
      AND tbl.relname = 'homepage_config'
      AND NOT tg.tgisinternal
  ) THEN
    CREATE TRIGGER trg_homepage_config_set_updated_at
      BEFORE UPDATE ON public.homepage_config
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END
$$;
