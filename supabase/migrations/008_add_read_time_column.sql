-- =====================================================
-- Migration 008: Add read_time to existing tables
-- =====================================================
-- Adiciona coluna read_time (obrigatoria) nas tabelas:
-- - newsletters
-- - mini-livros
-- - biblioteca
--
-- Default: 5 minutos para registros existentes
-- =====================================================

-- =====================================================
-- NEWSLETTERS
-- =====================================================
ALTER TABLE public.newsletters 
ADD COLUMN IF NOT EXISTS read_time INT NOT NULL DEFAULT 5 
CHECK (read_time > 0);

COMMENT ON COLUMN public.newsletters.read_time IS 'Tempo de leitura em minutos';

-- =====================================================
-- MINI-LIVROS
-- =====================================================
ALTER TABLE public."mini-livros" 
ADD COLUMN IF NOT EXISTS read_time INT NOT NULL DEFAULT 5 
CHECK (read_time > 0);

COMMENT ON COLUMN public."mini-livros".read_time IS 'Tempo de leitura em minutos';

-- =====================================================
-- BIBLIOTECA
-- =====================================================
ALTER TABLE public.biblioteca 
ADD COLUMN IF NOT EXISTS read_time INT NOT NULL DEFAULT 5 
CHECK (read_time > 0);

COMMENT ON COLUMN public.biblioteca.read_time IS 'Tempo de leitura em minutos';
