-- Migration: portal_news
-- Tabela de novidades do portal, gerenciável via painel admin

CREATE TABLE IF NOT EXISTS "public"."portal_news" (
    "id"            "uuid"          NOT NULL DEFAULT "gen_random_uuid"(),
    "title"         "text"          NOT NULL,
    "description"   "text",
    "icon"          "text"          NOT NULL,
    "category"      "text"          NOT NULL,
    "accent_color"  "text",
    "published_at"  timestamp with time zone NOT NULL DEFAULT "now"(),
    "display_order" integer         NOT NULL DEFAULT 0,
    "is_active"     boolean         NOT NULL DEFAULT true,
    "created_at"    timestamp with time zone DEFAULT "now"(),
    "updated_at"    timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "portal_news_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "portal_news_category_check" CHECK (
        "category" = ANY (ARRAY['launch'::"text", 'newsletter'::"text", 'content'::"text", 'tool'::"text"])
    )
);

ALTER TABLE "public"."portal_news" OWNER TO "postgres";

-- Trigger: atualiza updated_at automaticamente (usa função existente set_updated_at)
CREATE OR REPLACE TRIGGER "trg_portal_news_updated_at"
    BEFORE UPDATE ON "public"."portal_news"
    FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

-- RLS
ALTER TABLE "public"."portal_news" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_news_select_public"
    ON "public"."portal_news"
    FOR SELECT
    USING (true);

CREATE POLICY "portal_news_insert_admin"
    ON "public"."portal_news"
    FOR INSERT
    WITH CHECK ("public"."is_admin"());

CREATE POLICY "portal_news_update_admin"
    ON "public"."portal_news"
    FOR UPDATE
    USING ("public"."is_admin"())
    WITH CHECK ("public"."is_admin"());

CREATE POLICY "portal_news_delete_admin"
    ON "public"."portal_news"
    FOR DELETE
    USING ("public"."is_admin"());

-- Grants (padrão do projeto)
GRANT ALL ON TABLE "public"."portal_news" TO "anon";
GRANT ALL ON TABLE "public"."portal_news" TO "authenticated";
GRANT ALL ON TABLE "public"."portal_news" TO "service_role";

-- Seed: 4 itens de exemplo
INSERT INTO "public"."portal_news" ("title", "description", "icon", "category", "accent_color", "display_order") VALUES
    (
        'Bloco ''Ensinar'' será lançado em 7 de abril!',
        'Prepare-se para o novo módulo de criação de conteúdo educacional com suporte a IA.',
        '🚀',
        'launch',
        '#f97316',
        1
    ),
    (
        'Newsletter #42 já disponível',
        'Edição especial sobre IA generativa e produtividade — não perca.',
        '📰',
        'newsletter',
        '#22c55e',
        2
    ),
    (
        'Novos materiais na Biblioteca',
        '3 novos documentos adicionados na seção de liderança e gestão.',
        '📚',
        'content',
        '#ec4899',
        3
    ),
    (
        'Ferramenta de revisão de textos com IA',
        'Integração com Claude para revisão automática de conteúdo disponível.',
        '🔧',
        'tool',
        '#eab308',
        4
    );
