-- =====================================================
-- Migration 004: Content Tables RLS Policies
-- =====================================================
-- Habilita RLS e cria policies para newsletters,
-- mini-livros e biblioteca.
--
-- SELECT: publico (true) - conteudo visivel para todos
-- INSERT/UPDATE/DELETE: apenas admins via is_admin()
--
-- Dependencias: 003_admin_table.sql (is_admin())
-- =====================================================

-- =====================================================
-- NEWSLETTERS
-- =====================================================
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletters_select_public" ON public.newsletters;
CREATE POLICY "newsletters_select_public"
    ON public.newsletters
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "newsletters_insert_admin" ON public.newsletters;
CREATE POLICY "newsletters_insert_admin"
    ON public.newsletters
    FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "newsletters_update_admin" ON public.newsletters;
CREATE POLICY "newsletters_update_admin"
    ON public.newsletters
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "newsletters_delete_admin" ON public.newsletters;
CREATE POLICY "newsletters_delete_admin"
    ON public.newsletters
    FOR DELETE
    USING (public.is_admin());

REVOKE ALL ON public.newsletters FROM PUBLIC;
GRANT SELECT ON public.newsletters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletters TO authenticated;
GRANT ALL ON public.newsletters TO service_role;

-- Sequence grants para INSERT (id auto-increment)
GRANT USAGE, SELECT ON SEQUENCE newsletters_id_seq TO authenticated;
GRANT ALL ON SEQUENCE newsletters_id_seq TO service_role;

-- =====================================================
-- MINI-LIVROS (aspas duplas por causa do hifen)
-- =====================================================
ALTER TABLE public."mini-livros" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mini_livros_select_public" ON public."mini-livros";
CREATE POLICY "mini_livros_select_public"
    ON public."mini-livros"
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "mini_livros_insert_admin" ON public."mini-livros";
CREATE POLICY "mini_livros_insert_admin"
    ON public."mini-livros"
    FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "mini_livros_update_admin" ON public."mini-livros";
CREATE POLICY "mini_livros_update_admin"
    ON public."mini-livros"
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "mini_livros_delete_admin" ON public."mini-livros";
CREATE POLICY "mini_livros_delete_admin"
    ON public."mini-livros"
    FOR DELETE
    USING (public.is_admin());

REVOKE ALL ON public."mini-livros" FROM PUBLIC;
GRANT SELECT ON public."mini-livros" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."mini-livros" TO authenticated;
GRANT ALL ON public."mini-livros" TO service_role;

GRANT USAGE, SELECT ON SEQUENCE "mini-livros_id_seq" TO authenticated;
GRANT ALL ON SEQUENCE "mini-livros_id_seq" TO service_role;

-- =====================================================
-- BIBLIOTECA
-- =====================================================
ALTER TABLE public.biblioteca ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "biblioteca_select_public" ON public.biblioteca;
CREATE POLICY "biblioteca_select_public"
    ON public.biblioteca
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "biblioteca_insert_admin" ON public.biblioteca;
CREATE POLICY "biblioteca_insert_admin"
    ON public.biblioteca
    FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "biblioteca_update_admin" ON public.biblioteca;
CREATE POLICY "biblioteca_update_admin"
    ON public.biblioteca
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "biblioteca_delete_admin" ON public.biblioteca;
CREATE POLICY "biblioteca_delete_admin"
    ON public.biblioteca
    FOR DELETE
    USING (public.is_admin());

REVOKE ALL ON public.biblioteca FROM PUBLIC;
GRANT SELECT ON public.biblioteca TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.biblioteca TO authenticated;
GRANT ALL ON public.biblioteca TO service_role;

GRANT USAGE, SELECT ON SEQUENCE biblioteca_id_seq TO authenticated;
GRANT ALL ON SEQUENCE biblioteca_id_seq TO service_role;
