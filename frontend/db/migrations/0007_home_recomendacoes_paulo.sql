-- home_recomendacoes_paulo — single-row home block.
-- Idempotent. RLS + Supabase grants + storage.objects policies stripped:
--   - Auth at route layer (better-auth + admin role check).
--   - Storage served via /api/files/* — no Supabase Storage RLS.

CREATE TABLE IF NOT EXISTS public.home_recomendacoes_paulo (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  html_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger tg
    JOIN pg_class tbl ON tbl.oid = tg.tgrelid
    JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
    WHERE tg.tgname = 'trg_home_recomendacoes_paulo_set_updated_at'
      AND ns.nspname = 'public'
      AND tbl.relname = 'home_recomendacoes_paulo'
      AND NOT tg.tgisinternal
  ) THEN
    CREATE TRIGGER trg_home_recomendacoes_paulo_set_updated_at
      BEFORE UPDATE ON public.home_recomendacoes_paulo
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END
$$;

INSERT INTO public.home_recomendacoes_paulo (slug, title, description, html_path)
VALUES (
  'recomendacoes-paulo',
  'Recomendacoes do Paulo',
  'Curadoria pessoal com leituras, links e reflexoes que aprofundam o tema da semana.',
  '/materiais/home/recomendacoes/recomendacoes-paulo.html'
)
ON CONFLICT (slug) DO NOTHING;
