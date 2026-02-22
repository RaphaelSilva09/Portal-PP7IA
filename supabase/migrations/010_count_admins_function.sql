-- =====================================================
-- Migration 010: Admin Count Function (SECURED)
-- =====================================================
-- Cria funcao count_admins() que retorna total de admins
-- VALIDA internamente se caller é admin (Defense in Depth)
-- Usa SECURITY DEFINER para acessar auth.users
-- RAISE EXCEPTION se não-admin tentar chamar
--
-- Dependencias: 003_admin_table.sql (is_admin())
--
-- Segurança (4 camadas):
-- 1. Middleware: Bloqueia /painel-admin para não-admins
-- 2. RLS: Policies em public.users
-- 3. Função SQL: Validação interna is_admin() (ESTA MIGRATION)
-- 4. Frontend: Components protegidos por middleware
-- =====================================================

CREATE OR REPLACE FUNCTION public.count_admins()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
BEGIN
    -- VALIDAÇÃO OBRIGATÓRIA: apenas admins podem chamar
    -- Se não-admin tentar via DevTools ou API direta: EXCEPTION
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem acessar esta função';
    END IF;

    -- Retornar contagem apenas se passou validação acima
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM auth.users
        WHERE raw_app_meta_data->>'role' = 'admin'
    );
END;
$$;

COMMENT ON FUNCTION public.count_admins() IS 
'Retorna o número total de usuários com role admin. Requer is_admin() = true. Uso: SELECT count_admins();';

-- Grant para authenticated (mas função valida internamente)
GRANT EXECUTE ON FUNCTION public.count_admins() TO authenticated;

-- =====================================================
-- Testes de Segurança (executar manualmente)
-- =====================================================
-- Como admin:
-- SELECT public.count_admins(); 
-- Resultado esperado: número de admins (ex: 2)
--
-- Como usuário não-admin:
-- SELECT public.count_admins();
-- Resultado esperado: ERROR: Acesso negado: apenas administradores podem acessar esta função
-- =====================================================
