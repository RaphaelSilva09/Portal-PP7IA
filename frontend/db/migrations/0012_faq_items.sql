-- Perguntas frequentes públicas do portal (PDF 6.2).

CREATE TABLE IF NOT EXISTS public.faq_items (
  id           SERIAL PRIMARY KEY,
  question     TEXT NOT NULL,
  answer       TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT '',
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
    WHERE tg.tgname = 'trg_faq_items_set_updated_at'
      AND ns.nspname = 'public'
      AND tbl.relname = 'faq_items'
      AND NOT tg.tgisinternal
  ) THEN
    CREATE TRIGGER trg_faq_items_set_updated_at
      BEFORE UPDATE ON public.faq_items
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END
$$;
