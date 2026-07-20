-- Fundação de rastreamento de indicação (PDF 6.4 "Benefícios por indicação").
-- Esta migração só constrói a camada de rastreamento (convite → cadastro →
-- primeiro engajamento); o catálogo de benefícios em si é decisão de produto
-- separada, sem precedente no modelo de dados hoje.

CREATE TABLE IF NOT EXISTS public.referrals (
  id                      SERIAL PRIMARY KEY,
  referrer_user_id        UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  invited_email           TEXT NOT NULL,
  invite_token            TEXT NOT NULL UNIQUE,
  status                  TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'signed_up', 'engaged')),
  signed_up_user_id       UUID REFERENCES "user"(id) ON DELETE SET NULL,
  first_content_viewed_at TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_signed_up_user ON public.referrals(signed_up_user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger tg
    JOIN pg_class tbl ON tbl.oid = tg.tgrelid
    JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
    WHERE tg.tgname = 'trg_referrals_set_updated_at'
      AND ns.nspname = 'public'
      AND tbl.relname = 'referrals'
      AND NOT tg.tgisinternal
  ) THEN
    CREATE TRIGGER trg_referrals_set_updated_at
      BEFORE UPDATE ON public.referrals
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END
$$;
