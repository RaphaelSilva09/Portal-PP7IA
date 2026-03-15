-- ==========================================
-- Phase 1: Create Materialized Views
-- ==========================================
-- Purpose: Consolidate multiple queries into single MVs
--   - mv_home_latest_dates: 6 queries → 1 query
--   - mv_admin_dashboard_stats: 14+ queries → 1 query
--
-- Security:
--   - Home dates: PUBLIC access (portal é público)
--   - Dashboard stats: ADMIN-ONLY via REVOKE
--
-- Performance:
--   - Unique indices for REFRESH CONCURRENTLY (non-blocking)
--   - Initial refresh at end (non-CONCURRENT, MVs are empty)
--
-- Refresh strategy:
--   - RPC functions called by admin after publishing content
--   - See phase3_create_rpc_refresh_functions.sql
-- ==========================================

-- ==========================================
-- 1. Materialized View: Home Latest Dates
-- ==========================================
-- Consolidates latest created_at from 6 content tables
-- Replaces 6 parallel .getLatest() queries in useHomePageDates hook
-- ==========================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_home_latest_dates AS
SELECT 
  'newsletter' AS section_name,
  MAX(created_at) AS latest_created_at
FROM newsletters
WHERE created_at IS NOT NULL

UNION ALL

SELECT 
  'especial_semana' AS section_name,
  MAX(created_at) AS latest_created_at
FROM especial_semana
WHERE created_at IS NOT NULL

UNION ALL

SELECT 
  'radar_oportunidades' AS section_name,
  MAX(created_at) AS latest_created_at
FROM radar_oportunidades
WHERE created_at IS NOT NULL

UNION ALL

SELECT 
  'mini_livros' AS section_name,
  MAX(created_at) AS latest_created_at
FROM mini_livros
WHERE created_at IS NOT NULL

UNION ALL

SELECT 
  'biblioteca' AS section_name,
  MAX(created_at) AS latest_created_at
FROM biblioteca
WHERE created_at IS NOT NULL

UNION ALL

SELECT 
  'estudar' AS section_name,
  MAX(created_at) AS latest_created_at
FROM estudar
WHERE created_at IS NOT NULL;

-- Unique index required for REFRESH CONCURRENTLY (non-blocking refresh)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_home_dates_section 
ON mv_home_latest_dates(section_name);

-- Grant public access (portal content is public)
GRANT SELECT ON mv_home_latest_dates TO anon, public, authenticated;

COMMENT ON MATERIALIZED VIEW mv_home_latest_dates IS 
  'Consolidates latest created_at from 6 content tables. ' ||
  'Refresh via RPC: SELECT refresh_mv_home_latest_dates();';

-- ==========================================
-- 2. Materialized View: Admin Dashboard Stats
-- ==========================================
-- Consolidates all dashboard statistics into single query
-- Replaces 14+ queries in SupabaseAnalyticsRepository
-- Security: Admin-only via REVOKE (TypeScript check is UX, not security)
-- ==========================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_admin_dashboard_stats AS
SELECT
  -- Content counts (7 queries → 1 subquery)
  (SELECT COUNT(*) FROM newsletters) AS total_newsletters,
  (SELECT COUNT(*) FROM mini_livros) AS total_mini_livros,
  (SELECT COUNT(*) FROM biblioteca) AS total_biblioteca,
  (SELECT COUNT(*) FROM especial_semana) AS total_especial_semana,
  (SELECT COUNT(*) FROM ebooks) AS total_ebooks,
  (SELECT COUNT(*) FROM radar_oportunidades) AS total_radar_oportunidades,
  (SELECT COUNT(*) FROM estudar) AS total_estudar,
  
  -- Total content (computed, not queried)
  (
    (SELECT COUNT(*) FROM newsletters) +
    (SELECT COUNT(*) FROM mini_livros) +
    (SELECT COUNT(*) FROM biblioteca) +
    (SELECT COUNT(*) FROM especial_semana) +
    (SELECT COUNT(*) FROM ebooks) +
    (SELECT COUNT(*) FROM radar_oportunidades) +
    (SELECT COUNT(*) FROM estudar)
  ) AS total_content,
  
  -- User stats (3 queries → 3 subqueries)
  (SELECT COUNT(*) FROM public.users) AS total_users,
  
  (SELECT COUNT(*) FROM public.users 
   WHERE created_at >= NOW() - INTERVAL '30 days') AS new_users_last_30_days,
  
  -- Admin count (inline query replaces count_admins() function - security fix)
  -- Original count_admins() had SECURITY DEFINER + postgres owner = privilege escalation risk
  (SELECT COUNT(*) FROM auth.users 
   WHERE (raw_app_meta_data->>'role')::text = 'admin') AS total_admins;

-- Unique index for singleton row (enables REFRESH CONCURRENTLY)
-- Technique: index on constant boolean expression (all rows evaluate to true)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_stats_singleton 
ON mv_admin_dashboard_stats((true));

-- Security: REVOKE all access, admin check happens at TypeScript layer
-- (Materialized views cannot have RLS policies - only GRANT/REVOKE)
REVOKE ALL ON mv_admin_dashboard_stats FROM anon, public, authenticated;

-- Optional: GRANT to authenticated (requires admin check in TypeScript before query)
-- For now, keep fully revoked - access via server-side functions only
-- GRANT SELECT ON mv_admin_dashboard_stats TO authenticated;

COMMENT ON MATERIALIZED VIEW mv_admin_dashboard_stats IS 
  'Admin-only dashboard statistics. Consolidates 14+ queries into 1. ' ||
  'Refresh via RPC: SELECT refresh_mv_admin_dashboard_stats();';

-- ==========================================
-- Initial Population (MUST be non-CONCURRENT)
-- ==========================================
-- First refresh cannot use CONCURRENTLY (MVs are empty, unique indices need data)
-- Subsequent refreshes via RPC will use CONCURRENTLY (non-blocking)
-- ==========================================

REFRESH MATERIALIZED VIEW mv_home_latest_dates;
REFRESH MATERIALIZED VIEW mv_admin_dashboard_stats;

-- ==========================================
-- Verification Queries (run after creation)
-- ==========================================
-- Uncomment to verify MVs were created successfully:
--
-- -- Check MVs exist
-- SELECT matviewname, schemaname FROM pg_matviews 
-- WHERE matviewname LIKE 'mv_%' ORDER BY matviewname;
--
-- -- Check unique indices exist
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE indexname LIKE 'idx_mv_%' ORDER BY indexname;
--
-- -- View home dates data
-- SELECT * FROM mv_home_latest_dates ORDER BY section_name;
--
-- -- View dashboard stats (admin-only)
-- SELECT * FROM mv_admin_dashboard_stats;
--
-- -- Check permissions
-- SELECT 
--   relname AS table_name,
--   relacl AS permissions
-- FROM pg_class
-- WHERE relname LIKE 'mv_%' AND relkind = 'm';
