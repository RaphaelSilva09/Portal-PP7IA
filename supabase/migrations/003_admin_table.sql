-- =====================================================
-- Migration 003: Admin Helper Function (JWT-based)
-- =====================================================
-- Cria funcao is_admin() que verifica o role do usuario
-- a partir do JWT (app_metadata.role = 'admin').
--
-- Nao cria tabela admin separada - usa o sistema de
-- roles nativo do Supabase Auth (raw_app_meta_data).
--
-- Para tornar um usuario admin, execute via service_role:
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
-- WHERE id = 'UUID';
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT COALESCE(
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
        false
    );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Verifica se o usuario autenticado tem role admin no JWT';

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
