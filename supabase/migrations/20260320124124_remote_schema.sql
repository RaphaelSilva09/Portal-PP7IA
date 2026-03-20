create extension if not exists "pg_cron" with schema "pg_catalog";

create extension if not exists "pg_net" with schema "extensions";


  create table "public"."book" (
    "id" bigint generated always as identity not null,
    "title" text not null,
    "subtitle" text,
    "description" text,
    "cover_image_path" text,
    "cover_pdf_path" text,
    "intro_pdf_path" text,
    "badge_text" text,
    "order" integer default 0,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "intro_html_path" text
      );


alter table "public"."book" enable row level security;


  create table "public"."content_digest_queue" (
    "id" uuid not null default gen_random_uuid(),
    "table_name" text not null,
    "record_id" text not null,
    "record_data" jsonb not null,
    "created_at" timestamp with time zone not null default now(),
    "sent_at" timestamp with time zone
      );


alter table "public"."content_digest_queue" enable row level security;

alter table "public"."editorial" enable row level security;

alter table "public"."mini_livros" add column "relative_ebook" smallint;

CREATE UNIQUE INDEX book_pkey ON public.book USING btree (id);

CREATE UNIQUE INDEX content_digest_queue_pkey ON public.content_digest_queue USING btree (id);

CREATE INDEX idx_digest_queue_pending ON public.content_digest_queue USING btree (created_at DESC) WHERE (sent_at IS NULL);

CREATE INDEX idx_digest_queue_sent ON public.content_digest_queue USING btree (sent_at DESC) WHERE (sent_at IS NOT NULL);

CREATE UNIQUE INDEX unique_content_item ON public.content_digest_queue USING btree (table_name, record_id);

alter table "public"."book" add constraint "book_pkey" PRIMARY KEY using index "book_pkey";

alter table "public"."content_digest_queue" add constraint "content_digest_queue_pkey" PRIMARY KEY using index "content_digest_queue_pkey";

alter table "public"."content_digest_queue" add constraint "unique_content_item" UNIQUE using index "unique_content_item";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.queue_content_for_digest()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Insere registro na fila de digest
  -- Se já existir (tabela + id), ignora (ON CONFLICT DO NOTHING)
  INSERT INTO public.content_digest_queue (table_name, record_id, record_data)
  VALUES (
    TG_TABLE_NAME,
    NEW.id::text,
    jsonb_build_object(
      'id', NEW.id,
      'title', NEW.title,
      'read_time', NEW.read_time,
      'created_at', NEW.created_at
    )
  )
  ON CONFLICT (table_name, record_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."book" to "anon";

grant insert on table "public"."book" to "anon";

grant references on table "public"."book" to "anon";

grant select on table "public"."book" to "anon";

grant trigger on table "public"."book" to "anon";

grant truncate on table "public"."book" to "anon";

grant update on table "public"."book" to "anon";

grant delete on table "public"."book" to "authenticated";

grant insert on table "public"."book" to "authenticated";

grant references on table "public"."book" to "authenticated";

grant select on table "public"."book" to "authenticated";

grant trigger on table "public"."book" to "authenticated";

grant truncate on table "public"."book" to "authenticated";

grant update on table "public"."book" to "authenticated";

grant delete on table "public"."book" to "service_role";

grant insert on table "public"."book" to "service_role";

grant references on table "public"."book" to "service_role";

grant select on table "public"."book" to "service_role";

grant trigger on table "public"."book" to "service_role";

grant truncate on table "public"."book" to "service_role";

grant update on table "public"."book" to "service_role";

grant delete on table "public"."content_digest_queue" to "anon";

grant insert on table "public"."content_digest_queue" to "anon";

grant references on table "public"."content_digest_queue" to "anon";

grant select on table "public"."content_digest_queue" to "anon";

grant trigger on table "public"."content_digest_queue" to "anon";

grant truncate on table "public"."content_digest_queue" to "anon";

grant update on table "public"."content_digest_queue" to "anon";

grant delete on table "public"."content_digest_queue" to "authenticated";

grant insert on table "public"."content_digest_queue" to "authenticated";

grant references on table "public"."content_digest_queue" to "authenticated";

grant select on table "public"."content_digest_queue" to "authenticated";

grant trigger on table "public"."content_digest_queue" to "authenticated";

grant truncate on table "public"."content_digest_queue" to "authenticated";

grant update on table "public"."content_digest_queue" to "authenticated";

grant delete on table "public"."content_digest_queue" to "service_role";

grant insert on table "public"."content_digest_queue" to "service_role";

grant references on table "public"."content_digest_queue" to "service_role";

grant select on table "public"."content_digest_queue" to "service_role";

grant trigger on table "public"."content_digest_queue" to "service_role";

grant truncate on table "public"."content_digest_queue" to "service_role";

grant update on table "public"."content_digest_queue" to "service_role";


  create policy "book_public_read"
  on "public"."book"
  as permissive
  for select
  to public
using (true);



  create policy "editorial_admin_write"
  on "public"."editorial"
  as permissive
  for all
  to authenticated
using (true);



  create policy "editorial_public_read"
  on "public"."editorial"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER trg_queue_digest_biblioteca AFTER INSERT ON public.biblioteca FOR EACH ROW EXECUTE FUNCTION public.queue_content_for_digest();

CREATE TRIGGER trg_queue_digest_ebooks AFTER INSERT ON public.ebooks FOR EACH ROW EXECUTE FUNCTION public.queue_content_for_digest();

CREATE TRIGGER trg_queue_digest_especial_semana AFTER INSERT ON public.especial_semana FOR EACH ROW EXECUTE FUNCTION public.queue_content_for_digest();

CREATE TRIGGER trg_queue_digest_estudar AFTER INSERT ON public.estudar FOR EACH ROW EXECUTE FUNCTION public.queue_content_for_digest();

CREATE TRIGGER trg_queue_digest_mini_livros AFTER INSERT ON public.mini_livros FOR EACH ROW EXECUTE FUNCTION public.queue_content_for_digest();

CREATE TRIGGER trg_queue_digest_newsletters AFTER INSERT ON public.newsletters FOR EACH ROW EXECUTE FUNCTION public.queue_content_for_digest();

CREATE TRIGGER trg_queue_digest_radar_oportunidades AFTER INSERT ON public.radar_oportunidades FOR EACH ROW EXECUTE FUNCTION public.queue_content_for_digest();


