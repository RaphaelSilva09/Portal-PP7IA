-- =====================================================
-- Migration 003: -- =====================================================
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

CREATE OR REPLACE FUNCTION public.count_admins()
RETURNS INTEGER
LANGUAGE plpgsql  -- ✅ plpgsql (não sql) para suportar IF/RAISE
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
BEGIN
    -- ✅ VALIDAÇÃO OBRIGATÓRIA: apenas admins podem chamar
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores';
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
'Retorna o numero total de usuarios com role admin. Requer is_admin() = true';

-- ✅ Grant para authenticated (mas função valida internamente)
GRANT EXECUTE ON FUNCTION public.count_admins() TO authenticated;
