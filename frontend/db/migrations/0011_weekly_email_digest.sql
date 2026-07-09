CREATE TABLE IF NOT EXISTS public.email_digest_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  digest_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'skipped', 'empty', 'completed', 'partial', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  content_count INTEGER NOT NULL DEFAULT 0,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  error TEXT
);

CREATE TABLE IF NOT EXISTS public.email_digest_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.email_digest_runs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed')),
  provider_message_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  UNIQUE (run_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_email_digest_runs_started_at
  ON public.email_digest_runs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_digest_deliveries_run_status
  ON public.email_digest_deliveries(run_id, status);

CREATE OR REPLACE FUNCTION public.queue_content_for_digest()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.content_digest_queue (table_name, record_id, record_data)
  VALUES (
    TG_TABLE_NAME,
    NEW.id::text,
    to_jsonb(NEW)
  )
  ON CONFLICT (table_name, record_id) DO NOTHING;

  RETURN NEW;
END;
$function$;
