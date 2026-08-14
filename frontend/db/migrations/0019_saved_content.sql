-- "Marcar para ler depois" (PP7I-260811-1800, item 3.1 do backlog): o leitor
-- salva conteúdos numa fila pessoal, tipo "favoritos" organizados.
-- Mesmo molde de content_reactions (0014): 1 linha por (usuário, conteúdo).

CREATE TABLE IF NOT EXISTS public.saved_content (
  id           SERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id   TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_content_user ON public.saved_content(user_id, created_at DESC);
