-- =====================================================
-- Tabela de Convites - Portal PP7IA
-- =====================================================
--
-- Tabela para rastrear convites enviados por usuários.
-- Integra com Supabase Auth (generateLink) e Resend (envio de emails).
--
-- =====================================================

-- =====================================================
-- 1. TABELA DE CONVITES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.invites (
    -- Primary Key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Quem convidou
    inviter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    inviter_email TEXT,  -- backup caso inviter seja deletado

    -- Quem foi convidado
    invitee_email TEXT NOT NULL,

    -- Status do convite
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'failed')),

    -- Timestamps
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,

    -- Erro (se houver)
    error_message TEXT,

    -- Token do convite (gerado pelo Supabase)
    invite_token TEXT UNIQUE,

    -- Metadados
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. ÍNDICES
-- =====================================================

-- Índice para buscar convites por quem convidou
CREATE INDEX IF NOT EXISTS invites_inviter_id_idx
    ON public.invites(inviter_id);

-- Índice para buscar convites por email do convidado
CREATE INDEX IF NOT EXISTS invites_invitee_email_idx
    ON public.invites(invitee_email);

-- Índice para filtrar por status
CREATE INDEX IF NOT EXISTS invites_status_idx
    ON public.invites(status);

-- Índice para ordenar por data de criação
CREATE INDEX IF NOT EXISTS invites_created_at_idx
    ON public.invites(created_at DESC);

-- Índice único parcial: evita convites duplicados pendentes/enviados
CREATE UNIQUE INDEX IF NOT EXISTS invites_pending_email_idx
    ON public.invites(LOWER(invitee_email))
    WHERE status IN ('pending', 'sent');

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilita RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Remove policies existentes (idempotência)
DROP POLICY IF EXISTS "Users can view own invites" ON public.invites;
DROP POLICY IF EXISTS "Service role can manage invites" ON public.invites;

-- Policy: Usuários podem ver convites que enviaram
CREATE POLICY "Users can view own invites"
    ON public.invites
    FOR SELECT
    USING (auth.uid() = inviter_id);

-- Policy: Service role pode fazer tudo (usado pela Edge Function)
CREATE POLICY "Service role can manage invites"
    ON public.invites
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- 4. TRIGGER
-- =====================================================

-- Usa a função handle_updated_at() já existente
DROP TRIGGER IF EXISTS set_invites_updated_at ON public.invites;
CREATE TRIGGER set_invites_updated_at
    BEFORE UPDATE ON public.invites
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 5. GRANTS
-- =====================================================

-- Revoga privilégios públicos
REVOKE ALL ON public.invites FROM PUBLIC;

-- Usuários autenticados podem apenas ler seus convites
GRANT SELECT ON public.invites TO authenticated;

-- Service role pode fazer tudo
GRANT ALL ON public.invites TO service_role;

-- =====================================================
-- 6. COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE public.invites IS 'Rastreia convites enviados para novos usuários';
COMMENT ON COLUMN public.invites.inviter_id IS 'UUID do usuário que enviou o convite';
COMMENT ON COLUMN public.invites.inviter_email IS 'Email do inviter (backup)';
COMMENT ON COLUMN public.invites.invitee_email IS 'Email do convidado';
COMMENT ON COLUMN public.invites.status IS 'Status: pending, sent, accepted, failed';
COMMENT ON COLUMN public.invites.sent_at IS 'Quando o email foi enviado';
COMMENT ON COLUMN public.invites.accepted_at IS 'Quando o convite foi aceito';
COMMENT ON COLUMN public.invites.invite_token IS 'Token hash do convite (Supabase)';

-- =====================================================
-- 7. FUNÇÃO PARA MARCAR CONVITE COMO ACEITO
-- =====================================================

-- Função chamada quando um usuário aceita um convite
CREATE OR REPLACE FUNCTION public.mark_invite_accepted()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando um novo usuário é criado, marca convites para esse email como aceitos
    UPDATE public.invites
    SET
        status = 'accepted',
        accepted_at = NOW()
    WHERE
        LOWER(invitee_email) = LOWER(NEW.email)
        AND status = 'sent';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: marca convite como aceito quando usuário é criado
DROP TRIGGER IF EXISTS on_user_created_mark_invite ON public.users;
CREATE TRIGGER on_user_created_mark_invite
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.mark_invite_accepted();

-- =====================================================
-- FIM
-- =====================================================
