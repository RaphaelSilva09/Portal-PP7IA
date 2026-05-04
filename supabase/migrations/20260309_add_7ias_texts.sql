-- Migration: Adicionar textos sobre as 7 IAs na Biblioteca
-- Conteúdo "Minha Visão sobre IA" migrado da home page
-- Os outros dois textos são placeholders até o conteúdo final ser fornecido

INSERT INTO "public"."biblioteca" ("created_at", "title", "html_path", "pdf_path", "read_time")
VALUES
  (NOW(), 'Minha Visão sobre IA', NULL, NULL, 3),
  (NOW(), 'Introdução às 7 IAs', NULL, NULL, 5),
  (NOW(), 'Quais são as 7 IAs', NULL, NULL, 5)
ON CONFLICT ("title") DO NOTHING;


