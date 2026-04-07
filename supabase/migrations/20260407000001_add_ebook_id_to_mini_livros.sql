-- =============================================================================
-- Migration: add_ebook_id_to_mini_livros
-- Date: 2026-04-07
-- =============================================================================
-- Substitui a coluna `relative_ebook` (smallint, guarda ebook.order — FK fraca)
-- pela coluna `ebook_id` (bigint, FK real para ebooks.id).
--
-- Motivo:
--   `relative_ebook` armazenava o valor da coluna `order` do ebook, não seu `id`.
--   Como `order` é mutável e sem unicidade garantida, a referência era ambígua.
--   `ebook_id` armazena o `id` do ebook — imutável e identificador real.
--
-- Resultado:
--   - FK real com ON DELETE SET NULL
--   - Constraint UNIQUE (ebook_id, title) garante que capítulos dentro
--     do mesmo ebook não tenham títulos duplicados
-- =============================================================================

-- 1. Adicionar nova coluna ebook_id (nullable para backward compat)
ALTER TABLE "public"."mini_livros"
ADD COLUMN IF NOT EXISTS "ebook_id" bigint;

-- 2. Migrar dados existentes: resolver relative_ebook (ebook.order) → ebook_id (ebook.id)
--    Usa LIMIT 1 para desambiguar caso dois ebooks tenham o mesmo valor de order.
--    Em produção todos os mini_livros têm relative_ebook = null (bug era silencioso),
--    mas esta etapa garante integridade caso existam dados históricos.
UPDATE "public"."mini_livros" ml
SET ebook_id = (
    SELECT e.id
    FROM "public"."ebooks" e
    WHERE e."order" = ml.relative_ebook
    ORDER BY e.id
    LIMIT 1
)
WHERE ml.relative_ebook IS NOT NULL;

-- 3. Adicionar FK com ON DELETE SET NULL
--    Se um ebook for deletado, os capítulos ficam "órfãos" (ebook_id = null)
--    em vez de serem deletados em cascata.
ALTER TABLE "public"."mini_livros"
ADD CONSTRAINT "mini_livros_ebook_id_fkey"
FOREIGN KEY ("ebook_id")
REFERENCES "public"."ebooks"("id")
ON DELETE SET NULL;

-- 4. Remover coluna antiga
ALTER TABLE "public"."mini_livros"
DROP COLUMN IF EXISTS "relative_ebook";

-- 5. Adicionar constraint de unicidade por ebook
--    Permite "Introdução" em vários ebooks, mas impede duplicata no mesmo ebook.
--    NULL = mini_livro sem ebook associado; NULLs não participam de UNIQUE no Postgres.
ALTER TABLE "public"."mini_livros"
ADD CONSTRAINT "mini_livros_unique_title_per_ebook"
UNIQUE ("ebook_id", "title");
