-- Replays the queue hardening for environments that already applied the first
-- version of 0011 before it included the queue schema, trigger search_path, and triggers.
CREATE TABLE IF NOT EXISTS public.content_digest_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  record_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_content_digest_queue_table_record
  ON public.content_digest_queue(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_content_digest_queue_pending
  ON public.content_digest_queue(created_at ASC)
  WHERE sent_at IS NULL;

CREATE OR REPLACE FUNCTION public.queue_content_for_digest()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
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

DO $$
DECLARE
  content_table TEXT;
BEGIN
  FOREACH content_table IN ARRAY ARRAY[
    'biblioteca',
    'ebooks',
    'especial_semana',
    'estudar',
    'mini_livros',
    'newsletters',
    'radar_oportunidades'
  ]
  LOOP
    IF to_regclass(format('public.%I', content_table)) IS NOT NULL THEN
      EXECUTE format(
        'DROP TRIGGER IF EXISTS %I ON public.%I',
        'trg_queue_digest_' || content_table,
        content_table
      );
      EXECUTE format(
        'CREATE TRIGGER %I AFTER INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.queue_content_for_digest()',
        'trg_queue_digest_' || content_table,
        content_table
      );
    END IF;
  END LOOP;
END $$;
