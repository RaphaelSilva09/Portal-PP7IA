-- =====================================================
-- Promover Usuário a Admin
-- =====================================================
-- Script para promover um usuário existente a admin.
-- 
-- IMPORTANTE:
-- 1. Substitua 'SEU_EMAIL_AQUI' pelo email do usuário
-- 2. Execute via Supabase SQL Editor com permissões adequadas
-- 3. Usuário precisa estar cadastrado primeiro
-- =====================================================

-- Opção 1: Promover por email
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'SEU_EMAIL_AQUI';

-- Opção 2: Promover por ID
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- WHERE id = 'UUID_DO_USUARIO_AQUI';

-- =====================================================
-- Verificar se promoção funcionou
-- =====================================================
-- SELECT 
--     id,
--     email,
--     raw_app_meta_data->>'role' as role,
--     created_at
-- FROM auth.users
-- WHERE email = 'SEU_EMAIL_AQUI';

-- =====================================================
-- Remover privilégios admin (se necessário)
-- =====================================================
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data - 'role'
-- WHERE email = 'SEU_EMAIL_AQUI';

-- =====================================================
-- Listar todos os admins
-- =====================================================
-- SELECT 
--     id,
--     email,
--     raw_app_meta_data->>'role' as role,
--     created_at
-- FROM auth.users
-- WHERE raw_app_meta_data->>'role' = 'admin'
-- ORDER BY created_at DESC;
