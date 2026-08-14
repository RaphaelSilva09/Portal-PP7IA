-- Trilhas de leitura guiadas (PP7I-260811-1800, item 3.2 do backlog): roteiros
-- editoriais tipo "Entenda IA em 5 leituras" — sequência ordenada de conteúdos
-- já publicados, com progresso visual por leitor.

CREATE TABLE IF NOT EXISTS public.reading_trails (
  id               SERIAL PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  cover_image_path TEXT,
  published        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sequência ordenada de conteúdos já existentes (mesmo par content_type/content_id
-- de saved_content e content_reactions) — não duplica conteúdo, só referencia.
CREATE TABLE IF NOT EXISTS public.reading_trail_items (
  id           SERIAL PRIMARY KEY,
  trail_id     INTEGER NOT NULL REFERENCES public.reading_trails(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id   TEXT NOT NULL,
  position     INTEGER NOT NULL,
  UNIQUE (trail_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_trail_items_trail ON public.reading_trail_items(trail_id, position);

-- 1 linha por passo concluído por leitor. "Concluído" = abriu a página de
-- conteúdo daquele item estando logado (ver ContentViewTracker).
CREATE TABLE IF NOT EXISTS public.reading_trail_progress (
  id           SERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  trail_id     INTEGER NOT NULL REFERENCES public.reading_trails(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id   TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, trail_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_trail_progress_user_trail ON public.reading_trail_progress(user_id, trail_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger tg
    JOIN pg_class tbl ON tbl.oid = tg.tgrelid
    JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
    WHERE tg.tgname = 'trg_reading_trails_set_updated_at'
      AND ns.nspname = 'public'
      AND tbl.relname = 'reading_trails'
      AND NOT tg.tgisinternal
  ) THEN
    CREATE TRIGGER trg_reading_trails_set_updated_at
      BEFORE UPDATE ON public.reading_trails
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END
$$;
