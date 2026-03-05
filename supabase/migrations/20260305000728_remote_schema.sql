


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."count_admins"() RETURNS integer
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
BEGIN
    -- VALIDAÇÃO OBRIGATÓRIA: apenas admins podem chamar
    -- Se não-admin tentar via DevTools ou API direta: EXCEPTION
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem acessar esta função';
    END IF;

    -- Retornar contagem apenas se passou validação acima
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM auth.users
        WHERE raw_app_meta_data->>'role' = 'admin'
    );
END;
$$;


ALTER FUNCTION "public"."count_admins"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."count_admins"() IS 'Retorna o número total de usuários com role admin. Requer is_admin() = true. Uso: SELECT count_admins();';



CREATE OR REPLACE FUNCTION "public"."get_user_profile"("user_id" "uuid") RETURNS TABLE("id" "uuid", "email" "text", "nome" "text", "celular" "text", "accept_email_updates" boolean, "accept_whatsapp_updates" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.nome,
        u.celular,
        u.accept_email_updates,
        u.accept_whatsapp_updates,
        u.created_at,
        u.updated_at
    FROM public.users u
    WHERE u.id = user_id;
END;
$$;


ALTER FUNCTION "public"."get_user_profile"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        nome,
        celular,
        accept_email_updates,
        accept_whatsapp_updates
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
        COALESCE(NEW.raw_user_meta_data->>'celular', ''),
        COALESCE((NEW.raw_user_meta_data->>'accept_email_updates')::boolean, false),
        COALESCE((NEW.raw_user_meta_data->>'accept_whatsapp_updates')::boolean, false)
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
        RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT COALESCE(
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
        false
    );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_admin"() IS 'Verifica se o usuario autenticado tem role admin no JWT';



CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."biblioteca" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "title" character varying NOT NULL,
    "html_path" "text",
    "pdf_path" "text",
    "read_time" integer,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."biblioteca" OWNER TO "postgres";


COMMENT ON TABLE "public"."biblioteca" IS 'Dados dos conteúdos publicados na biblioteca';



COMMENT ON COLUMN "public"."biblioteca"."read_time" IS 'Tempo de leitura em minutos';



ALTER TABLE "public"."biblioteca" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."biblioteca_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."ebooks" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "description" "text",
    "cover_image_path" "text",
    "cover_pdf_path" "text",
    "intro_pdf_path" "text",
    "badge_text" "text",
    "order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "intro_html_path" "text"
);


ALTER TABLE "public"."ebooks" OWNER TO "postgres";


ALTER TABLE "public"."ebooks" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."ebooks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."especial_semana" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "html_path" "text",
    "pdf_path" "text",
    "read_time" integer NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "especial-semana_read_time_check" CHECK (("read_time" > 0))
);


ALTER TABLE "public"."especial_semana" OWNER TO "postgres";


COMMENT ON TABLE "public"."especial_semana" IS 'Armazena especiais semanais: artigos, apps, tutoriais';



COMMENT ON COLUMN "public"."especial_semana"."read_time" IS 'Tempo de leitura em minutos (obrigatorio)';



CREATE SEQUENCE IF NOT EXISTS "public"."especial-semana_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."especial-semana_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."especial-semana_id_seq" OWNED BY "public"."especial_semana"."id";



CREATE TABLE IF NOT EXISTS "public"."estudar" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "title" character varying NOT NULL,
    "html_path" "text",
    "pdf_path" "text",
    "read_time" integer,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."estudar" OWNER TO "postgres";


COMMENT ON TABLE "public"."estudar" IS 'This is a duplicate of biblioteca';



COMMENT ON COLUMN "public"."estudar"."read_time" IS 'Tempo de leitura em minutos';



ALTER TABLE "public"."estudar" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."estudar_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."mini_livros" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "title" character varying NOT NULL,
    "html_path" "text",
    "pdf_path" "text",
    "read_time" integer,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mini_livros" OWNER TO "postgres";


COMMENT ON TABLE "public"."mini_livros" IS 'Dados dos mini-livros publicadas';



COMMENT ON COLUMN "public"."mini_livros"."read_time" IS 'Tempo de leitura em minutos';



ALTER TABLE "public"."mini_livros" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."mini-livros_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."newsletters" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "title" character varying NOT NULL,
    "html_path" "text",
    "pdf_path" "text",
    "read_time" integer,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."newsletters" OWNER TO "postgres";


COMMENT ON TABLE "public"."newsletters" IS 'Dados dos conteúdos publicados da biblioteca';



COMMENT ON COLUMN "public"."newsletters"."read_time" IS 'Tempo de leitura em minutos';



ALTER TABLE "public"."newsletters" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."newsletters_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."radar_oportunidades" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "title" character varying NOT NULL,
    "html_path" "text",
    "pdf_path" "text",
    "read_time" integer,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."radar_oportunidades" OWNER TO "postgres";


COMMENT ON TABLE "public"."radar_oportunidades" IS 'This is a duplicate of biblioteca';



COMMENT ON COLUMN "public"."radar_oportunidades"."read_time" IS 'Tempo de leitura em minutos';



ALTER TABLE "public"."radar_oportunidades" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."radar-oportunidades_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "nome" "text" NOT NULL,
    "celular" "text" NOT NULL,
    "accept_email_updates" boolean DEFAULT false NOT NULL,
    "accept_whatsapp_updates" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "users_celular_check" CHECK (("length"("regexp_replace"("celular", '[^0-9]'::"text", ''::"text", 'g'::"text")) >= 10)),
    CONSTRAINT "users_consent_check" CHECK ((("accept_email_updates" = true) OR ("accept_whatsapp_updates" = true))),
    CONSTRAINT "users_email_check" CHECK (("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text")),
    CONSTRAINT "users_nome_check" CHECK (("length"(TRIM(BOTH FROM "nome")) > 0))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Dados complementares dos usuários do Portal PP7IA';



COMMENT ON COLUMN "public"."users"."id" IS 'UUID do usuário (FK para auth.users)';



COMMENT ON COLUMN "public"."users"."email" IS 'Email do usuário (único)';



COMMENT ON COLUMN "public"."users"."nome" IS 'Nome completo do usuário';



COMMENT ON COLUMN "public"."users"."celular" IS 'Celular no formato brasileiro';



COMMENT ON COLUMN "public"."users"."accept_email_updates" IS 'Aceita receber atualizações por email';



COMMENT ON COLUMN "public"."users"."accept_whatsapp_updates" IS 'Aceita receber atualizações por WhatsApp';



ALTER TABLE ONLY "public"."especial_semana" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."especial-semana_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."biblioteca"
    ADD CONSTRAINT "biblioteca_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."biblioteca"
    ADD CONSTRAINT "biblioteca_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."biblioteca"
    ADD CONSTRAINT "biblioteca_title_key" UNIQUE ("title");



ALTER TABLE ONLY "public"."ebooks"
    ADD CONSTRAINT "ebooks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."especial_semana"
    ADD CONSTRAINT "especial-semana_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."estudar"
    ADD CONSTRAINT "estudar_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."estudar"
    ADD CONSTRAINT "estudar_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."estudar"
    ADD CONSTRAINT "estudar_title_key" UNIQUE ("title");



ALTER TABLE ONLY "public"."mini_livros"
    ADD CONSTRAINT "mini-livros_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."mini_livros"
    ADD CONSTRAINT "mini-livros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mini_livros"
    ADD CONSTRAINT "mini-livros_title_key" UNIQUE ("title");



ALTER TABLE ONLY "public"."newsletters"
    ADD CONSTRAINT "newsletters_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."newsletters"
    ADD CONSTRAINT "newsletters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletters"
    ADD CONSTRAINT "newsletters_title_key" UNIQUE ("title");



ALTER TABLE ONLY "public"."radar_oportunidades"
    ADD CONSTRAINT "radar-oportunidades_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."radar_oportunidades"
    ADD CONSTRAINT "radar-oportunidades_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."radar_oportunidades"
    ADD CONSTRAINT "radar-oportunidades_title_key" UNIQUE ("title");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "users_created_at_idx" ON "public"."users" USING "btree" ("created_at" DESC);



CREATE INDEX "users_email_idx" ON "public"."users" USING "btree" ("email");



CREATE UNIQUE INDEX "users_email_unique_idx" ON "public"."users" USING "btree" ("lower"("email"));



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trg_newsletters_updated_at" BEFORE UPDATE ON "public"."newsletters" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Enable read access for all users" ON "public"."biblioteca" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."mini_livros" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."newsletters" FOR SELECT USING (true);



CREATE POLICY "Users can delete own data" ON "public"."users" FOR DELETE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert own profile" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can read own data" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own data" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "admin_select_all_users" ON "public"."users" FOR SELECT USING ("public"."is_admin"());



ALTER TABLE "public"."biblioteca" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "biblioteca_delete_admin" ON "public"."biblioteca" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "biblioteca_insert_admin" ON "public"."biblioteca" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "biblioteca_select_public" ON "public"."biblioteca" FOR SELECT USING (true);



CREATE POLICY "biblioteca_update_admin" ON "public"."biblioteca" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."ebooks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ebooks_delete_admin" ON "public"."ebooks" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "ebooks_insert_admin" ON "public"."ebooks" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "ebooks_select_public" ON "public"."ebooks" FOR SELECT USING (true);



CREATE POLICY "ebooks_update_admin" ON "public"."ebooks" FOR UPDATE USING ("public"."is_admin"());



ALTER TABLE "public"."especial_semana" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "especial_semana_delete_admin" ON "public"."especial_semana" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "especial_semana_insert_admin" ON "public"."especial_semana" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "especial_semana_select_public" ON "public"."especial_semana" FOR SELECT USING (true);



CREATE POLICY "especial_semana_update_admin" ON "public"."especial_semana" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."estudar" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "estudar_delete_admin" ON "public"."estudar" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "estudar_insert_admin" ON "public"."estudar" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "estudar_select_public" ON "public"."estudar" FOR SELECT USING (true);



CREATE POLICY "estudar_update_admin" ON "public"."estudar" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "mini-livros_delete_admin" ON "public"."mini_livros" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "mini-livros_insert_admin" ON "public"."mini_livros" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "mini-livros_select_public" ON "public"."mini_livros" FOR SELECT USING (true);



CREATE POLICY "mini-livros_update_admin" ON "public"."mini_livros" FOR UPDATE USING ("public"."is_admin"());



ALTER TABLE "public"."mini_livros" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "mini_livros_delete_admin" ON "public"."mini_livros" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "mini_livros_insert_admin" ON "public"."mini_livros" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "mini_livros_select_public" ON "public"."mini_livros" FOR SELECT USING (true);



CREATE POLICY "mini_livros_update_admin" ON "public"."mini_livros" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."newsletters" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "newsletters_delete_admin" ON "public"."newsletters" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "newsletters_insert_admin" ON "public"."newsletters" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "newsletters_insert_public" ON "public"."newsletters" FOR INSERT WITH CHECK (true);



CREATE POLICY "newsletters_select_public" ON "public"."newsletters" FOR SELECT USING (true);



CREATE POLICY "newsletters_update_admin" ON "public"."newsletters" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."radar_oportunidades" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "radar_oportunidades_delete_admin" ON "public"."radar_oportunidades" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "radar_oportunidades_insert_admin" ON "public"."radar_oportunidades" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "radar_oportunidades_select_public" ON "public"."radar_oportunidades" FOR SELECT USING (true);



CREATE POLICY "radar_oportunidades_update_admin" ON "public"."radar_oportunidades" FOR UPDATE USING ("public"."is_admin"());



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."count_admins"() TO "anon";
GRANT ALL ON FUNCTION "public"."count_admins"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."count_admins"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_profile"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_profile"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_profile"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."biblioteca" TO "anon";
GRANT ALL ON TABLE "public"."biblioteca" TO "authenticated";
GRANT ALL ON TABLE "public"."biblioteca" TO "service_role";



GRANT ALL ON SEQUENCE "public"."biblioteca_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."biblioteca_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."biblioteca_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."ebooks" TO "anon";
GRANT ALL ON TABLE "public"."ebooks" TO "authenticated";
GRANT ALL ON TABLE "public"."ebooks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ebooks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ebooks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ebooks_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."especial_semana" TO "anon";
GRANT ALL ON TABLE "public"."especial_semana" TO "authenticated";
GRANT ALL ON TABLE "public"."especial_semana" TO "service_role";



GRANT ALL ON SEQUENCE "public"."especial-semana_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."especial-semana_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."especial-semana_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."estudar" TO "anon";
GRANT ALL ON TABLE "public"."estudar" TO "authenticated";
GRANT ALL ON TABLE "public"."estudar" TO "service_role";



GRANT ALL ON SEQUENCE "public"."estudar_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."estudar_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."estudar_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."mini_livros" TO "anon";
GRANT ALL ON TABLE "public"."mini_livros" TO "authenticated";
GRANT ALL ON TABLE "public"."mini_livros" TO "service_role";



GRANT ALL ON SEQUENCE "public"."mini-livros_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."mini-livros_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."mini-livros_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."newsletters" TO "anon";
GRANT ALL ON TABLE "public"."newsletters" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletters" TO "service_role";



GRANT ALL ON SEQUENCE "public"."newsletters_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."newsletters_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."newsletters_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."radar_oportunidades" TO "anon";
GRANT ALL ON TABLE "public"."radar_oportunidades" TO "authenticated";
GRANT ALL ON TABLE "public"."radar_oportunidades" TO "service_role";



GRANT ALL ON SEQUENCE "public"."radar-oportunidades_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."radar-oportunidades_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."radar-oportunidades_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "materiais_delete_admin"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'materiais'::text) AND public.is_admin()));



  create policy "materiais_insert_admin"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'materiais'::text) AND public.is_admin()));



  create policy "materiais_select_public"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'materiais'::text));



  create policy "materiais_update_admin"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'materiais'::text) AND public.is_admin()));



  create policy "storage_delete_admin"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (public.is_admin());



  create policy "storage_delete_biblioteca"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'Biblioteca'::text) AND public.is_admin()));



  create policy "storage_delete_minilivros"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'MiniLivros'::text) AND public.is_admin()));



  create policy "storage_insert_admin"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (public.is_admin());



  create policy "storage_insert_biblioteca"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'Biblioteca'::text) AND public.is_admin()));



  create policy "storage_select_biblioteca"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'Biblioteca'::text));



  create policy "storage_select_minilivros"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'MiniLivros'::text));



  create policy "storage_select_public"
  on "storage"."objects"
  as permissive
  for select
  to public
using (true);



  create policy "storage_update_admin"
  on "storage"."objects"
  as permissive
  for update
  to public
using (public.is_admin());



  create policy "storage_update_biblioteca"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'Biblioteca'::text) AND public.is_admin()))
with check (((bucket_id = 'Biblioteca'::text) AND public.is_admin()));



  create policy "storage_update_minilivros"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'MiniLivros'::text) AND public.is_admin()))
with check (((bucket_id = 'MiniLivros'::text) AND public.is_admin()));



