-- Perguntas enviadas por leitores cadastrados, triadas no admin (PDF 6.3).
-- Perguntas relevantes podem virar conteúdo publicado nos blocos normais
-- (fluxo editorial manual, fora do escopo desta tabela).

CREATE TABLE IF NOT EXISTS public.reader_questions (
  id           SERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  question     TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'archived')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reader_questions_user_id ON public.reader_questions(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger tg
    JOIN pg_class tbl ON tbl.oid = tg.tgrelid
    JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
    WHERE tg.tgname = 'trg_reader_questions_set_updated_at'
      AND ns.nspname = 'public'
      AND tbl.relname = 'reader_questions'
      AND NOT tg.tgisinternal
  ) THEN
    CREATE TRIGGER trg_reader_questions_set_updated_at
      BEFORE UPDATE ON public.reader_questions
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END
$$;
