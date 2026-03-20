-- Migration: Add "index" column to material tables for manual ordering
-- Tables: newsletters, mini_livros, especial_semana, biblioteca, estudar, radar_oportunidades
-- index = 0 (DEFAULT) means unordered (appears after indexed items, sorted by created_at DESC)
-- index > 0 means the item has an explicit position (1 = first)

ALTER TABLE newsletters         ADD COLUMN IF NOT EXISTS "index" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE mini_livros         ADD COLUMN IF NOT EXISTS "index" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE especial_semana     ADD COLUMN IF NOT EXISTS "index" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE biblioteca          ADD COLUMN IF NOT EXISTS "index" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE estudar             ADD COLUMN IF NOT EXISTS "index" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE radar_oportunidades ADD COLUMN IF NOT EXISTS "index" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_newsletters_index         ON newsletters("index");
CREATE INDEX IF NOT EXISTS idx_mini_livros_index         ON mini_livros("index");
CREATE INDEX IF NOT EXISTS idx_especial_semana_index     ON especial_semana("index");
CREATE INDEX IF NOT EXISTS idx_biblioteca_index          ON biblioteca("index");
CREATE INDEX IF NOT EXISTS idx_estudar_index             ON estudar("index");
CREATE INDEX IF NOT EXISTS idx_radar_oportunidades_index ON radar_oportunidades("index");

-- Populate index preserving current display order so the UI is unchanged after migration.
-- newsletters, mini_livros, biblioteca: currently ordered by created_at DESC
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn FROM newsletters
)
UPDATE newsletters SET "index" = ranked.rn FROM ranked WHERE newsletters.id = ranked.id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn FROM mini_livros
)
UPDATE mini_livros SET "index" = ranked.rn FROM ranked WHERE mini_livros.id = ranked.id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn FROM biblioteca
)
UPDATE biblioteca SET "index" = ranked.rn FROM ranked WHERE biblioteca.id = ranked.id;

-- especial_semana, estudar, radar_oportunidades: currently ordered by id DESC
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id DESC) AS rn FROM especial_semana
)
UPDATE especial_semana SET "index" = ranked.rn FROM ranked WHERE especial_semana.id = ranked.id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id DESC) AS rn FROM estudar
)
UPDATE estudar SET "index" = ranked.rn FROM ranked WHERE estudar.id = ranked.id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id DESC) AS rn FROM radar_oportunidades
)
UPDATE radar_oportunidades SET "index" = ranked.rn FROM ranked WHERE radar_oportunidades.id = ranked.id;
