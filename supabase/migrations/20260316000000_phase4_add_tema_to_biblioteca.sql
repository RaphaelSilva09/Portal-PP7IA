-- =============================================================================
-- Phase 4: Adicionar coluna 'tema' na tabela biblioteca
-- =============================================================================
-- Objetivo: Subdividir a biblioteca por temas temáticos.
-- Temas disponíveis:
--   biblioteca-dos-7       → Biblioteca dos 7
--   saude                  → Saúde
--   investimentos-financas → Investimentos | Finanças
--   viagens-restaurantes   → Viagens | Restaurantes
--   tecnologia             → Tecnologia
--   prompts                → Prompts
--   diversos               → Diversos (padrão para itens existentes)
-- =============================================================================

-- 1. Adicionar coluna tema com valor padrão 'diversos'
ALTER TABLE biblioteca
ADD COLUMN IF NOT EXISTS tema TEXT NOT NULL DEFAULT 'diversos';

-- 2. Aplicar constraint de validação dos valores permitidos
ALTER TABLE biblioteca
ADD CONSTRAINT biblioteca_tema_check CHECK (
    tema IN (
        'biblioteca-dos-7',
        'saude',
        'investimentos-financas',
        'viagens-restaurantes',
        'tecnologia',
        'prompts',
        'diversos'
    )
);

-- 3. Criar índice para filtros por tema (performance)
CREATE INDEX IF NOT EXISTS idx_biblioteca_tema ON biblioteca(tema);

-- 4. Criar índice composto para filtro + ordenação (padrão de uso mais comum)
CREATE INDEX IF NOT EXISTS idx_biblioteca_tema_created_at
ON biblioteca(tema, created_at DESC);

-- =============================================================================
-- Verificação
-- =============================================================================
-- SELECT tema, COUNT(*) FROM biblioteca GROUP BY tema ORDER BY tema;
