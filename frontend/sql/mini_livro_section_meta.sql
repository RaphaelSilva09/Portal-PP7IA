-- Mini-livro Section Meta
-- Armazena o título e descrição customizáveis de cada seção (introdução, encerramento)

CREATE TABLE IF NOT EXISTS mini_livro_section_meta (
    kind TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed inicial
INSERT INTO mini_livro_section_meta (kind, title, description) VALUES
    ('introducao', 'Introdução', 'Antes de mergulhar nos capítulos, confira estes conteúdos introdutórios.'),
    ('encerramento', 'Encerramento', 'Depois do último capítulo, seguem os blocos finais desta jornada.')
ON CONFLICT (kind) DO NOTHING;

-- RLS
ALTER TABLE mini_livro_section_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mini_livro_section_meta_select_policy"
    ON mini_livro_section_meta
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "mini_livro_section_meta_insert_policy"
    ON mini_livro_section_meta
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "mini_livro_section_meta_update_policy"
    ON mini_livro_section_meta
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "mini_livro_section_meta_delete_policy"
    ON mini_livro_section_meta
    FOR DELETE
    TO authenticated
    USING (true);
