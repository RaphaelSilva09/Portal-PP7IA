-- =====================================================
-- Migration 003: Admin Table & Helper Function
-- =====================================================
-- Cria tabela de administradores e funcao is_admin()
-- usada pelas RLS policies de todas as tabelas.
--
-- Dependencias: 001_auth_schema.sql (auth.users)
-- =====================================================

-- 1. TABELA ADMIN
CREATE TABLE IF NOT EXISTS public.admin (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.admin IS 'Administradores do Portal PP7IA';
COMMENT ON COLUMN public.admin.id IS 'UUID do admin (FK para auth.users)';
COMMENT ON COLUMN public.admin.created_at IS 'Data de criacao do registro de admin';

-- 2. RLS NA TABELA ADMIN
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_self" ON public.admin;
CREATE POLICY "admin_select_self"
    ON public.admin
    FOR SELECT
    USING (auth.uid() = id);

-- Sem INSERT/UPDATE/DELETE policies para authenticated.
-- Gerenciamento de admins feito apenas via service_role
-- (Supabase Dashboard ou API server-side).

-- 3. GRANTS
REVOKE ALL ON public.admin FROM PUBLIC;
GRANT SELECT ON public.admin TO authenticated;
GRANT ALL ON public.admin TO service_role;

-- 4. FUNCAO is_admin()
-- SECURITY DEFINER: executa com privilegios do criador (bypassa RLS da tabela admin)
-- STABLE: nao modifica dados, resultado pode ser cacheado dentro da transacao
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin WHERE id = auth.uid()
    );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Verifica se o usuario autenticado e admin';

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
