-- Adiciona coluna content_hash para detecção de mudanças no cálculo de tempo de leitura.
-- SHA-256 do texto extraído do HTML — usado para pular conteúdo não modificado.

ALTER TABLE "public"."newsletters"
    ADD COLUMN "content_hash" text;

ALTER TABLE "public"."mini_livros"
    ADD COLUMN "content_hash" text;

ALTER TABLE "public"."biblioteca"
    ADD COLUMN "content_hash" text;

ALTER TABLE "public"."especial_semana"
    ADD COLUMN "content_hash" text;

ALTER TABLE "public"."radar_oportunidades"
    ADD COLUMN "content_hash" text;

ALTER TABLE "public"."estudar"
    ADD COLUMN "content_hash" text;

ALTER TABLE "public"."ebooks"
    ADD COLUMN "content_hash" text;

COMMENT ON COLUMN "public"."newsletters"."content_hash" IS 'SHA-256 do texto extraído do HTML — usado para detectar mudanças no cálculo de tempo de leitura';
COMMENT ON COLUMN "public"."mini_livros"."content_hash" IS 'SHA-256 do texto extraído do HTML — usado para detectar mudanças no cálculo de tempo de leitura';
COMMENT ON COLUMN "public"."biblioteca"."content_hash" IS 'SHA-256 do texto extraído do HTML — usado para detectar mudanças no cálculo de tempo de leitura';
COMMENT ON COLUMN "public"."especial_semana"."content_hash" IS 'SHA-256 do texto extraído do HTML — usado para detectar mudanças no cálculo de tempo de leitura';
COMMENT ON COLUMN "public"."radar_oportunidades"."content_hash" IS 'SHA-256 do texto extraído do HTML — usado para detectar mudanças no cálculo de tempo de leitura';
COMMENT ON COLUMN "public"."estudar"."content_hash" IS 'SHA-256 do texto extraído do HTML — usado para detectar mudanças no cálculo de tempo de leitura';
COMMENT ON COLUMN "public"."ebooks"."content_hash" IS 'SHA-256 do texto extraído do HTML — usado para detectar mudanças no cálculo de tempo de leitura';
