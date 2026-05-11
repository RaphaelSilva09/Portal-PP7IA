-- Phase 1: rewrite auth.* references in function bodies + add current_user_id helper.
-- After this, count_admins / is_admin / refresh_mv_admin_dashboard_stats invocations stop failing.
-- handle_new_user is dropped (trigger lives on better-auth user table now, not auth.users).

-- 1) current_user_id helper.
-- App layer per request: SET LOCAL app.user_id = '<uuid-from-better-auth-session>';
CREATE OR REPLACE FUNCTION public.current_user_id() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid;
$$;

-- 2) is_admin — reads role from "user" table via current_user_id.
DROP FUNCTION IF EXISTS public.is_admin();
CREATE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM "user"
    WHERE id = public.current_user_id()
      AND role = 'admin'
  );
$$;

-- 3) count_admins — counts admins on "user" table.
DROP FUNCTION IF EXISTS public.count_admins();
CREATE FUNCTION public.count_admins() RETURNS integer
LANGUAGE sql STABLE AS $$
  SELECT count(*)::int FROM "user" WHERE role = 'admin';
$$;

-- 4) refresh_mv_admin_dashboard_stats — admin gate uses new is_admin().
-- Note: the MV itself is recreated in 0003. Until then this fn errors at REFRESH.
-- Since better-auth + admin UI rewrites are still pending, OK to leave fn broken on MV-refresh path
-- but at least the admin-check passes once is_admin() is rewritten above.
DROP FUNCTION IF EXISTS public.refresh_mv_admin_dashboard_stats();
CREATE FUNCTION public.refresh_mv_admin_dashboard_stats() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden: admin only';
  END IF;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_admin_dashboard_stats;
END;
$$;

-- 5) handle_new_user — orphaned, trigger never restored on Railway. Drop.
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
