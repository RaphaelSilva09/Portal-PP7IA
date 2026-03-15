-- ==========================================
-- Phase 3: RPC Functions for Manual MV Refresh
-- ==========================================
-- Purpose: Admin-callable functions to refresh materialized views
--          after publishing/updating content
-- 
-- Why RPC instead of triggers:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY cannot execute in transaction blocks,
-- which is the context where trigger functions run. Attempting to use triggers
-- would cause error: "REFRESH CONCURRENTLY cannot run inside a transaction block"
-- 
-- Security Model:
-- - SECURITY DEFINER: Function runs with postgres privileges (needed for REFRESH)
-- - auth.jwt() check: Only admins can execute (database-level authorization)
-- - SET search_path: Prevents search_path injection attacks
-- - GRANT/REVOKE: Only authenticated users can call (anon key blocked)
--
-- Usage Pattern (TypeScript):
--   await supabase.rpc('refresh_mv_home_latest_dates');
--   await supabase.rpc('refresh_mv_admin_dashboard_stats');
--
-- Error Handling (TypeScript):
--   const { error } = await supabase.rpc('refresh_mv_home_latest_dates');
--   if (error) {
--     console.error('[MV Refresh] Failed:', error.message);
--     // Don't throw - main operation already succeeded
--   }
-- ==========================================

-- ==========================================
-- RPC: Refresh Home Latest Dates MV
-- ==========================================
-- Call after INSERT/UPDATE on:
--   - newsletters
--   - mini_livros
--   - biblioteca
--   - especial_semana
--   - radar_oportunidades
--   - estudar
-- ==========================================

CREATE OR REPLACE FUNCTION refresh_mv_home_latest_dates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Database-level admin check (not TypeScript - this is real security)
  -- TypeScript checks are UX only (anon key is public, can be bypassed)
  IF (auth.jwt() -> 'app_metadata' ->> 'role')::text != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Refresh with CONCURRENTLY (non-blocking for readers)
  -- Requires unique index: idx_mv_home_dates_section
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_home_latest_dates;
  
  -- Log success (visible in Supabase Dashboard logs)
  RAISE NOTICE 'Successfully refreshed mv_home_latest_dates';
END;
$$;

COMMENT ON FUNCTION refresh_mv_home_latest_dates() IS 'Refreshes home latest dates materialized view. Admin-only. Call after publishing/updating content in: newsletters, mini_livros, biblioteca, especial_semana, radar_oportunidades, estudar. Usage: await supabase.rpc(''refresh_mv_home_latest_dates'');';

-- Only authenticated users can call (anon key blocked)
GRANT EXECUTE ON FUNCTION refresh_mv_home_latest_dates() TO authenticated;
REVOKE EXECUTE ON FUNCTION refresh_mv_home_latest_dates() FROM anon, public;

-- ==========================================
-- RPC: Refresh Admin Dashboard Stats MV
-- ==========================================
-- Call after INSERT/UPDATE/DELETE on:
--   - public.users
--   - All content tables (newsletters, mini_livros, etc.)
--   - ebooks
--
-- Recommendation: Always call both RPC functions after any admin
-- content operation (simpler than conditional logic)
-- ==========================================

CREATE OR REPLACE FUNCTION refresh_mv_admin_dashboard_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Database-level admin check
  IF (auth.jwt() -> 'app_metadata' ->> 'role')::text != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Refresh with CONCURRENTLY
  -- Requires unique index: idx_mv_dashboard_stats_singleton
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_admin_dashboard_stats;
  
  -- Log success
  RAISE NOTICE 'Successfully refreshed mv_admin_dashboard_stats';
END;
$$;

COMMENT ON FUNCTION refresh_mv_admin_dashboard_stats() IS 'Refreshes admin dashboard stats materialized view. Admin-only. Call after any content/user changes that affect dashboard statistics. Usage: await supabase.rpc(''refresh_mv_admin_dashboard_stats'');';

GRANT EXECUTE ON FUNCTION refresh_mv_admin_dashboard_stats() TO authenticated;
REVOKE EXECUTE ON FUNCTION refresh_mv_admin_dashboard_stats() FROM anon, public;

-- ==========================================
-- Verification Queries (run after creation)
-- ==========================================
-- Uncomment to verify RPC functions were created correctly:
--
-- -- Check functions exist with correct security settings
-- SELECT 
--   proname AS function_name,
--   prosecdef AS is_security_definer,
--   proowner::regrole AS owner,
--   proacl AS permissions
-- FROM pg_proc 
-- WHERE proname LIKE 'refresh_mv_%'
-- ORDER BY proname;
--
-- Expected output:
-- function_name                    | is_security_definer | owner    | permissions
-- ---------------------------------|---------------------|----------|-------------------------
-- refresh_mv_admin_dashboard_stats | t                   | postgres | {authenticated=X/postgres}
-- refresh_mv_home_latest_dates     | t                   | postgres | {authenticated=X/postgres}
--
-- -- Test RPC call as admin (should succeed)
-- SELECT refresh_mv_home_latest_dates();
-- -- Expected: NOTICE "Successfully refreshed mv_home_latest_dates"
--
-- SELECT refresh_mv_admin_dashboard_stats();
-- -- Expected: NOTICE "Successfully refreshed mv_admin_dashboard_stats"
--
-- -- Test RPC call as non-admin (should fail)
-- -- (Run from a non-admin user session in Supabase Dashboard)
-- SELECT refresh_mv_home_latest_dates();
-- -- Expected ERROR: "Unauthorized: Admin access required"
--
-- -- Verify MVs have fresh data after refresh
-- SELECT * FROM mv_home_latest_dates ORDER BY section_name;
-- SELECT * FROM mv_admin_dashboard_stats;
