-- Tabela editorial: singleton (id = 1 sempre)
-- Conteúdo editável pelo admin via rich text (HTML)

CREATE TABLE editorial (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT editorial_single_row CHECK (id = 1)
);

INSERT INTO editorial (id, content) VALUES (1, '');
