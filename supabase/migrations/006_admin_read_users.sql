-- =====================================================
-- Migration 006: Admin Access to Users Table
-- =====================================================
-- Permite que admins leiam todos os perfis de usuarios.
-- Policies existentes de self-access (001_auth_schema)
-- permanecem inalteradas.
--
-- Dependencias: 003_admin_function.sql (is_admin())
-- =====================================================

DROP POLICY IF EXISTS "admin_select_all_users" ON public.users;
CREATE POLICY "admin_select_all_users"
    ON public.users
    FOR SELECT
    USING (public.is_admin());
