-- Limite de uso diário por IP do Axioma (diagnóstico de IA do bloco Estudar).
-- Tabela já existia no banco, criada por uma migração legada fora do sistema
-- ativo em frontend/db/migrations; esta migração
-- só passa a rastreá-la aqui — CREATE TABLE IF NOT EXISTS é no-op em produção.

CREATE TABLE IF NOT EXISTS public.axioma_usage (
  ip_address text NOT NULL,
  usage_date date NOT NULL DEFAULT current_date,
  count      int  NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_address, usage_date)
);
