-- =====================================================
-- Migration 007: Especial da Semana Table & Storage
-- =====================================================
-- Cria tabela especial-semana com RLS policies e
-- storage bucket para HTML/PDF
--
-- Schema identico as outras tabelas de conteudo
-- RLS: SELECT publico, INSERT/UPDATE/DELETE admin-only
--
-- Dependencias: 003_admin_table.sql (is_admin())
-- =====================================================

-- =====================================================
-- TABLE: especial-semana
-- =====================================================
CREATE TABLE IF NOT EXISTS public."especial-semana" (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    title TEXT NOT NULL,
    html_path TEXT NULL,
    pdf_path TEXT NULL,
    read_time INT NOT NULL CHECK (read_time > 0)
);

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE public."especial-semana" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "especial_semana_select_public" ON public."especial-semana";
CREATE POLICY "especial_semana_select_public"
    ON public."especial-semana"
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "especial_semana_insert_admin" ON public."especial-semana";
CREATE POLICY "especial_semana_insert_admin"
    ON public."especial-semana"
    FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "especial_semana_update_admin" ON public."especial-semana";
CREATE POLICY "especial_semana_update_admin"
    ON public."especial-semana"
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "especial_semana_delete_admin" ON public."especial-semana";
CREATE POLICY "especial_semana_delete_admin"
    ON public."especial-semana"
    FOR DELETE
    USING (public.is_admin());

-- =====================================================
-- GRANTS
-- =====================================================
REVOKE ALL ON public."especial-semana" FROM PUBLIC;
GRANT SELECT ON public."especial-semana" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."especial-semana" TO authenticated;
GRANT ALL ON public."especial-semana" TO service_role;

-- Sequence grants para INSERT (id auto-increment)
GRANT USAGE, SELECT ON SEQUENCE "especial-semana_id_seq" TO authenticated;
GRANT ALL ON SEQUENCE "especial-semana_id_seq" TO service_role;

-- =====================================================
-- STORAGE BUCKET: especial-semana
-- =====================================================
-- Criar bucket via Supabase Dashboard ou inserir direto:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'especial-semana',
    'especial-semana',
    true,  -- public read
    52428800,  -- 50MB
    ARRAY['text/html', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE RLS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "especial_semana_storage_select_public" ON storage.objects;
CREATE POLICY "especial_semana_storage_select_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'especial-semana');

DROP POLICY IF EXISTS "especial_semana_storage_insert_admin" ON storage.objects;
CREATE POLICY "especial_semana_storage_insert_admin"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'especial-semana' AND
        public.is_admin()
    );

DROP POLICY IF EXISTS "especial_semana_storage_update_admin" ON storage.objects;
CREATE POLICY "especial_semana_storage_update_admin"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'especial-semana' AND
        public.is_admin()
    )
    WITH CHECK (
        bucket_id = 'especial-semana' AND
        public.is_admin()
    );

DROP POLICY IF EXISTS "especial_semana_storage_delete_admin" ON storage.objects;
CREATE POLICY "especial_semana_storage_delete_admin"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'especial-semana' AND
        public.is_admin()
    );

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON TABLE public."especial-semana" IS 'Armazena especiais semanais: artigos, apps, tutoriais';
COMMENT ON COLUMN public."especial-semana".read_time IS 'Tempo de leitura em minutos (obrigatorio)';
