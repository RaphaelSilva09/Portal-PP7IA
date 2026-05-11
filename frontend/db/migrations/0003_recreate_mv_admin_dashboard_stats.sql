-- Phase 1: recreate mv_admin_dashboard_stats against the better-auth "user" table.
-- Original Supabase MV was dropped during data-migration test (referenced auth.users).

CREATE MATERIALIZED VIEW public.mv_admin_dashboard_stats AS
SELECT
  ( SELECT count(*) FROM public.newsletters )           AS total_newsletters,
  ( SELECT count(*) FROM public.mini_livros )           AS total_mini_livros,
  ( SELECT count(*) FROM public.biblioteca )            AS total_biblioteca,
  ( SELECT count(*) FROM public.especial_semana )       AS total_especial_semana,
  ( SELECT count(*) FROM public.ebooks )                AS total_ebooks,
  ( SELECT count(*) FROM public.radar_oportunidades )   AS total_radar_oportunidades,
  ( SELECT count(*) FROM public.estudar )               AS total_estudar,
  (
    ( SELECT count(*) FROM public.newsletters )
    + ( SELECT count(*) FROM public.mini_livros )
    + ( SELECT count(*) FROM public.biblioteca )
    + ( SELECT count(*) FROM public.especial_semana )
    + ( SELECT count(*) FROM public.ebooks )
    + ( SELECT count(*) FROM public.radar_oportunidades )
    + ( SELECT count(*) FROM public.estudar )
  )                                                      AS total_content,
  ( SELECT count(*) FROM "user" )                        AS total_users,
  ( SELECT count(*) FROM "user"
    WHERE "createdAt" >= now() - interval '30 days' )    AS new_users_last_30_days,
  ( SELECT count(*) FROM "user" WHERE role = 'admin' )   AS total_admins
WITH NO DATA;

-- Singleton index — the MV always has 1 row, lets us REFRESH MATERIALIZED VIEW CONCURRENTLY.
CREATE UNIQUE INDEX idx_mv_dashboard_stats_singleton
  ON public.mv_admin_dashboard_stats USING btree ((true));

-- First populate.
REFRESH MATERIALIZED VIEW public.mv_admin_dashboard_stats;
