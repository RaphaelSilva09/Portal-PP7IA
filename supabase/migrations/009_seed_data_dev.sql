-- =====================================================
-- Seed Data: Dados de exemplo para teste do admin
-- =====================================================
-- Popula tabelas com dados de exemplo:
-- - newsletters (3 exemplos)
-- - mini-livros (2 exemplos)  
-- - biblioteca (2 exemplos)
-- - especial-semana (2 exemplos)
--
-- NOTA: Execute APENAS em ambiente de desenvolvimento!
-- Para limpar: DELETE FROM <tabela> WHERE id IN (...);
-- =====================================================

-- =====================================================
-- NEWSLETTERS (Seed)
-- =====================================================
INSERT INTO public.newsletters (title, html_path, pdf_path, read_time, created_at) VALUES
('PP-News #003 - IA Generativa no Brasil', '/newsletters/003.html', '/newsletters/003.pdf', 8, NOW() - INTERVAL '7 days'),
('PP-News #004 - Startups de IA em 2026', '/newsletters/004.html', '/newsletters/004.pdf', 10, NOW() - INTERVAL '3 days'),
('PP-News #005 - O Futuro da Automação', '/newsletters/005.html', NULL, 6, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- =====================================================
-- MINI-LIVROS (Seed)
-- =====================================================
INSERT INTO public."mini-livros" (title, html_path, pdf_path, read_time, created_at) VALUES
('Mini-livro #003: Liderança em Tempos de IA', NULL, '/mini-livros/003.pdf', 15, NOW() - INTERVAL '14 days'),
('Mini-livro #004: A Arte de Fazer Perguntas', '/mini-livros/004.html', '/mini-livros/004.pdf', 12, NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- BIBLIOTECA (Seed)
-- =====================================================
INSERT INTO public.biblioteca (title, html_path, pdf_path, read_time, created_at) VALUES
('Guia de Ferramentas IA 2026', '/biblioteca/guia_ferramentas_ia.html', '/biblioteca/guia_ferramentas_ia.pdf', 20, NOW() - INTERVAL '30 days'),
('Checklist: Implementando IA na Empresa', '/biblioteca/checklist_ia_empresa.html', NULL, 10, NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ESPECIAL DA SEMANA (Seed)
-- =====================================================
INSERT INTO public."especial-semana" (title, html_path, pdf_path, read_time, created_at) VALUES
('Brasil no Radar da IA', '/especial-semana/001.html', NULL, 7, NOW() - INTERVAL '14 days'),
('Top 10 Apps IA para Produtividade', '/especial-semana/002.html', '/especial-semana/002.pdf', 12, NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Verificar dados inseridos
-- =====================================================
-- SELECT 'newsletters' as tabela, COUNT(*) as total FROM public.newsletters
-- UNION ALL
-- SELECT 'mini-livros', COUNT(*) FROM public."mini-livros"
-- UNION ALL
-- SELECT 'biblioteca', COUNT(*) FROM public.biblioteca
-- UNION ALL
-- SELECT 'especial-semana', COUNT(*) FROM public."especial-semana";
