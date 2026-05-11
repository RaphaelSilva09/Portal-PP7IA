-- Phase 5: normalize storage path columns to a single relative format.
-- Goal: every value becomes "<bucket>/<path>" (e.g. "materiais/mini-livros/027.html")
-- so the app can build URLs as `${PUBLIC_FILES_BASE_URL}/${value}` →
-- /api/files/materiais/mini-livros/027.html, served from STORAGE_ROOT/materiais/...
--
-- Idempotent: running twice produces the same result (each transform short-circuits
-- if the value is already normalized).

-- Helper: strip leading Supabase storage URL prefix + leading slash.
-- Pattern matched: https://<host>/storage/v1/object/public/<rest>
--                  /<rest>      (legacy paths starting with slash)
--                  <rest>       (already normalized)
CREATE OR REPLACE FUNCTION public._normalize_storage_path(p text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p IS NULL OR p = '' THEN NULL
    WHEN p ~ '^https?://[^/]+/storage/v1/object/public/' THEN
      regexp_replace(p, '^https?://[^/]+/storage/v1/object/public/', '')
    WHEN p LIKE '/%' THEN
      substring(p FROM 2)
    ELSE p
  END;
$$;

UPDATE public.biblioteca         SET html_path = public._normalize_storage_path(html_path),
                                     pdf_path  = public._normalize_storage_path(pdf_path);

UPDATE public.book               SET cover_image_path = public._normalize_storage_path(cover_image_path),
                                     cover_pdf_path   = public._normalize_storage_path(cover_pdf_path),
                                     intro_html_path  = public._normalize_storage_path(intro_html_path),
                                     intro_pdf_path   = public._normalize_storage_path(intro_pdf_path);

UPDATE public.ebooks             SET cover_image_path = public._normalize_storage_path(cover_image_path),
                                     cover_pdf_path   = public._normalize_storage_path(cover_pdf_path),
                                     intro_html_path  = public._normalize_storage_path(intro_html_path),
                                     intro_pdf_path   = public._normalize_storage_path(intro_pdf_path);

UPDATE public.especial_semana    SET html_path = public._normalize_storage_path(html_path),
                                     pdf_path  = public._normalize_storage_path(pdf_path);

UPDATE public.estudar            SET html_path = public._normalize_storage_path(html_path),
                                     pdf_path  = public._normalize_storage_path(pdf_path);

UPDATE public.mini_livro_sections SET html_path = public._normalize_storage_path(html_path);

UPDATE public.mini_livros        SET html_path = public._normalize_storage_path(html_path),
                                     pdf_path  = public._normalize_storage_path(pdf_path);

UPDATE public.newsletters        SET html_path = public._normalize_storage_path(html_path),
                                     pdf_path  = public._normalize_storage_path(pdf_path);

UPDATE public.radar_oportunidades SET html_path = public._normalize_storage_path(html_path),
                                      pdf_path  = public._normalize_storage_path(pdf_path);

-- announcement_bars.link_url left untouched — it is a generic CTA URL, not a storage path.

-- vw_searchable_content is a view derived from the base tables — refreshes automatically.

-- Drop the helper after the one-time normalization. Comment this out if you want
-- to run the migration script multiple times (idempotent on already-normalized rows).
DROP FUNCTION public._normalize_storage_path(text);
