-- Reações rápidas pós-leitura por conteúdo (PDF 6.4 "Reações e Feedback").
-- Uma reação por leitor por conteúdo (não múltiplas simultâneas).

CREATE TABLE IF NOT EXISTS public.content_reactions (
  id           SERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id   TEXT NOT NULL,
  reaction     TEXT NOT NULL CHECK (reaction IN ('fez_pensar', 'apliquei', 'quero_mais', 'nao_esperava')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_content_reactions_content ON public.content_reactions(content_type, content_id);
