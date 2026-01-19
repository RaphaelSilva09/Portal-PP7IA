-- =====================================================
-- Migration 002: Criação Automática de Perfil
-- =====================================================

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        nome,
        celular,
        accept_email_updates,
        accept_whatsapp_updates
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
        COALESCE(NEW.raw_user_meta_data->>'celular', ''),
        COALESCE((NEW.raw_user_meta_data->>'accept_email_updates')::boolean, false),
        COALESCE((NEW.raw_user_meta_data->>'accept_whatsapp_updates')::boolean, false)
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Migrar dados existentes
INSERT INTO public.users (id, email, nome, celular, accept_email_updates, accept_whatsapp_updates)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE(au.raw_user_meta_data->>'celular', ''),
    COALESCE((au.raw_user_meta_data->>'accept_email_updates')::boolean, false),
    COALESCE((au.raw_user_meta_data->>'accept_whatsapp_updates')::boolean, false)
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;
