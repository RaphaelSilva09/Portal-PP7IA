-- Revoga acesso público à função count_admins() (SECURITY DEFINER legada)
-- A MV mv_admin_dashboard_stats já substitui esta função de forma mais segura
REVOKE ALL ON FUNCTION public.count_admins() FROM anon;
REVOKE ALL ON FUNCTION public.count_admins() FROM authenticated;
-- service_role mantém acesso pois é usado internamente
