-- =====================================================
-- Schema de Autenticação - Portal PP7IA
-- =====================================================
-- 
-- Este arquivo contém a estrutura de banco de dados para
-- o sistema de autenticação do Portal PP7IA.
-- 
-- Princípios aplicados:
-- - DDD: Schema reflete o modelo de domínio
-- - Data Integrity: Constraints e validações
-- - Security: RLS (Row Level Security) habilitado
-- - Auditability: Timestamps automáticos
--
-- =====================================================

-- =====================================================
-- 1. EXTENSÕES
-- =====================================================

-- Habilita extensão UUID (se ainda não estiver)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. TABELA DE USUÁRIOS
-- =====================================================

-- Cria tabela de usuários (complementa auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.users (
    -- Primary Key (sincronizado com auth.users)
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Dados Pessoais
    email TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    celular TEXT NOT NULL,
    
    -- Preferências de Comunicação
    accept_email_updates BOOLEAN NOT NULL DEFAULT false,
    accept_whatsapp_updates BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadados
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_nome_check CHECK (LENGTH(TRIM(nome)) > 0),
    CONSTRAINT users_celular_check CHECK (LENGTH(REGEXP_REPLACE(celular, '[^0-9]', '', 'g')) >= 10),
    CONSTRAINT users_consent_check CHECK (accept_email_updates = true OR accept_whatsapp_updates = true)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON public.users(created_at DESC);

-- Comentários de documentação
COMMENT ON TABLE public.users IS 'Dados complementares dos usuários do Portal PP7IA';
COMMENT ON COLUMN public.users.id IS 'UUID do usuário (FK para auth.users)';
COMMENT ON COLUMN public.users.email IS 'Email do usuário (único)';
COMMENT ON COLUMN public.users.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN public.users.celular IS 'Celular no formato brasileiro';
COMMENT ON COLUMN public.users.accept_email_updates IS 'Aceita receber atualizações por email';
COMMENT ON COLUMN public.users.accept_whatsapp_updates IS 'Aceita receber atualizações por WhatsApp';

-- =====================================================
-- 3. TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilita RLS na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ler seus próprios dados
CREATE POLICY "Users can read own data"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own data"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Usuários autenticados podem criar seu próprio perfil
CREATE POLICY "Users can insert own profile"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Usuários podem deletar seus próprios dados
CREATE POLICY "Users can delete own data"
    ON public.users
    FOR DELETE
    USING (auth.uid() = id);

-- =====================================================
-- 5. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para buscar dados completos do usuário
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    nome TEXT,
    celular TEXT,
    accept_email_updates BOOLEAN,
    accept_whatsapp_updates BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.nome,
        u.celular,
        u.accept_email_updates,
        u.accept_whatsapp_updates,
        u.created_at,
        u.updated_at
    FROM public.users u
    WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. GRANTS
-- =====================================================

-- Revoga todos os privilégios públicos
REVOKE ALL ON public.users FROM PUBLIC;

-- Concede SELECT, INSERT, UPDATE, DELETE para usuários autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;

-- Concede todos os privilégios para service_role
GRANT ALL ON public.users TO service_role;

-- =====================================================
-- 7. VALIDAÇÕES ADICIONAIS
-- =====================================================

-- Adiciona validação de email único (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx 
    ON public.users(LOWER(email));

-- =====================================================
-- 8. DADOS DE EXEMPLO (DESENVOLVIMENTO)
-- =====================================================
-- Descomente para inserir dados de teste

/*
-- Usuário de teste (requer que exista em auth.users)
INSERT INTO public.users (
    id,
    email,
    nome,
    celular,
    accept_email_updates,
    accept_whatsapp_updates
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'teste@exemplo.com',
    'Usuário Teste',
    '(11) 98765-4321',
    true,
    true
) ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
