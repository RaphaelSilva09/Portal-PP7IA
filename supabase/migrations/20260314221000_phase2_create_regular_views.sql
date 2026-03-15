-- ==========================================
-- Phase 2: Create Regular Views + FTS Indices
-- ==========================================
-- Purpose: Unified search across 4 content tables
--   - vw_searchable_content: Combines newsletters, mini_livros, 
--     biblioteca, especial_semana with Full-Text Search support
--
-- Security:
--   - WITH (security_invoker = true) → inherits RLS from base tables
--   - Without this, views run with creator (postgres) privileges, bypassing RLS
--
-- Performance:
--   - FTS indices on BASE TABLES (not on view - regular views can't have indices)
--   - Portuguese language support via 'portuguese' config
--
-- Access:
--   - GRANT to anon, public, authenticated (portal is public)
-- ==========================================

-- ==========================================
-- 1. Create Full-Text Search Indices on Base Tables
-- ==========================================
-- FTS indices MUST be on base tables, not on views
-- Regular views cannot have indices (only Materialized Views can)
-- ==========================================

-- Newsletter FTS index
CREATE INDEX IF NOT EXISTS idx_newsletters_fts 
ON newsletters 
USING gin(to_tsvector('portuguese', COALESCE(title, '')));

COMMENT ON INDEX idx_newsletters_fts IS 
  'Full-text search index for newsletters (Portuguese language)';

-- Mini Livros FTS index
CREATE INDEX IF NOT EXISTS idx_mini_livros_fts 
ON mini_livros 
USING gin(to_tsvector('portuguese', COALESCE(title, '')));

COMMENT ON INDEX idx_mini_livros_fts IS 
  'Full-text search index for mini_livros (Portuguese language)';

-- Biblioteca FTS index
CREATE INDEX IF NOT EXISTS idx_biblioteca_fts 
ON biblioteca 
USING gin(to_tsvector('portuguese', COALESCE(title, '')));

COMMENT ON INDEX idx_biblioteca_fts IS 
  'Full-text search index for biblioteca (Portuguese language)';

-- Especial Semana FTS index
CREATE INDEX IF NOT EXISTS idx_especial_semana_fts 
ON especial_semana 
USING gin(to_tsvector('portuguese', COALESCE(title, '')));

COMMENT ON INDEX idx_especial_semana_fts IS 
  'Full-text search index for especial_semana (Portuguese language)';

-- ==========================================
-- 2. Regular View: Searchable Content
-- ==========================================
-- Unifies 4 content tables for search
-- security_invoker = true ensures RLS from base tables is applied
-- ==========================================

CREATE OR REPLACE VIEW vw_searchable_content
WITH (security_invoker = true)
AS
-- Newsletters
SELECT 
  'newsletter' AS content_type,
  id,
  title,
  created_at,
  html_path,
  pdf_path,
  read_time,
  to_tsvector('portuguese', COALESCE(title, '')) AS title_ts
FROM newsletters

UNION ALL

-- Mini Livros
SELECT 
  'mini_livro' AS content_type,
  id,
  title,
  created_at,
  html_path,
  pdf_path,
  read_time,
  to_tsvector('portuguese', COALESCE(title, '')) AS title_ts
FROM mini_livros

UNION ALL

-- Biblioteca
SELECT 
  'biblioteca' AS content_type,
  id,
  title,
  created_at,
  html_path,
  pdf_path,
  read_time,
  to_tsvector('portuguese', COALESCE(title, '')) AS title_ts
FROM biblioteca

UNION ALL

-- Especial Semana
SELECT 
  'especial_semana' AS content_type,
  id,
  title,
  created_at,
  html_path,
  pdf_path,
  read_time,
  to_tsvector('portuguese', COALESCE(title, '')) AS title_ts
FROM especial_semana;

-- Grant public access (portal content is public)
GRANT SELECT ON vw_searchable_content TO anon, public, authenticated;

COMMENT ON VIEW vw_searchable_content IS 'Unified search view across 4 content tables with FTS support. Uses security_invoker=true to inherit RLS from base tables. Search example: SELECT * FROM vw_searchable_content WHERE title_ts @@ to_tsquery(''portuguese'', ''inteligencia & artificial'');';

-- ==========================================
-- Verification Queries (run after creation)
-- ==========================================
-- Uncomment to verify view and indices were created:
--
-- -- Check FTS indices exist
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes 
-- WHERE indexname LIKE 'idx_%_fts'
-- ORDER BY tablename;
--
-- -- Check view exists with correct security settings
-- SELECT 
--   viewname,
--   viewowner,
--   definition
-- FROM pg_views 
-- WHERE viewname = 'vw_searchable_content';
--
-- -- Test FTS search (example)
-- SELECT 
--   content_type,
--   title,
--   created_at
-- FROM vw_searchable_content
-- WHERE title_ts @@ to_tsquery('portuguese', 'inteligencia | artificial')
-- ORDER BY created_at DESC
-- LIMIT 10;
--
-- -- Check view permissions
-- SELECT 
--   relname AS view_name,
--   relacl AS permissions
-- FROM pg_class
-- WHERE relname = 'vw_searchable_content' AND relkind = 'v';
