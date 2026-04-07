-- =============================================================================
-- Migration: fix_insert_bugs
-- Date: 2026-04-07
-- =============================================================================

-- Fix 1: Adicionar coluna read_time à tabela ebooks
-- O frontend já enviava este campo mas a coluna estava ausente no schema,
-- causando erro PGRST204 (coluna não reconhecida pela API) em todos os INSERTs.
ALTER TABLE "public"."ebooks"
ADD COLUMN IF NOT EXISTS "read_time" integer;

-- Fix 2: Remover constraint UNIQUE (title) da tabela mini_livros
-- Capítulos de ebooks distintos naturalmente compartilham títulos
-- (ex: "Introdução", "Capítulo 1", "Conclusão"), tornando esta constraint inválida
-- e causando erro 23505 (unique_violation / 409 Conflict) ao criar novos capítulos.
ALTER TABLE "public"."mini_livros"
DROP CONSTRAINT IF EXISTS "mini-livros_title_key";
