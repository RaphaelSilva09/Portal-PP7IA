-- =============================================================================
-- Migration: add_part_order_and_ebook_id_to_mini_livros_safe
-- Date: 2026-04-07
-- =============================================================================
-- Safe/idempotent follow-up because version 20260407000001 may already be
-- recorded in remote migration history. Keeps relative_ebook for a later cleanup.
-- =============================================================================

ALTER TABLE "public"."mini_livros"
ADD COLUMN IF NOT EXISTS "part_order" smallint;

ALTER TABLE "public"."mini_livros"
ADD COLUMN IF NOT EXISTS "ebook_id" bigint;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'mini_livros'
          AND column_name = 'relative_ebook'
    ) THEN
        UPDATE "public"."mini_livros" ml
        SET ebook_id = (
            SELECT e.id
            FROM "public"."ebooks" e
            WHERE e."order" = ml.relative_ebook
            ORDER BY e.id
            LIMIT 1
        )
        WHERE ml.relative_ebook IS NOT NULL
          AND ml.ebook_id IS NULL;

        UPDATE "public"."mini_livros"
        SET part_order = relative_ebook
        WHERE relative_ebook IS NOT NULL
          AND part_order IS NULL;
    END IF;
END $$;

-- Historical data fix for a test mini-livro created while tab selection was
-- incorrectly coupled to an existing ebook record.
UPDATE "public"."mini_livros"
SET part_order = 2,
    ebook_id = NULL
WHERE id = 8
  AND title = 'teste';

UPDATE "public"."mini_livros"
SET part_order = 1
WHERE part_order IS NULL;

UPDATE "public"."mini_livros"
SET part_order = 1
WHERE part_order NOT BETWEEN 1 AND 3;

UPDATE "public"."mini_livros" ml
SET ebook_id = NULL
WHERE ml.ebook_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM "public"."ebooks" e
      WHERE e.id = ml.ebook_id
  );

ALTER TABLE "public"."mini_livros"
ALTER COLUMN "part_order" SET DEFAULT 1;

ALTER TABLE "public"."mini_livros"
ALTER COLUMN "part_order" SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'mini_livros_part_order_check'
    ) THEN
        ALTER TABLE "public"."mini_livros"
        ADD CONSTRAINT "mini_livros_part_order_check"
        CHECK ("part_order" BETWEEN 1 AND 3);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'mini_livros_ebook_id_fkey'
    ) THEN
        ALTER TABLE "public"."mini_livros"
        ADD CONSTRAINT "mini_livros_ebook_id_fkey"
        FOREIGN KEY ("ebook_id")
        REFERENCES "public"."ebooks"("id")
        ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_mini_livros_part_order"
ON "public"."mini_livros" ("part_order");

-- Remove overly broad title uniqueness constraints if present. Do not replace
-- them with part-scoped title uniqueness; repeated chapter titles are allowed.
ALTER TABLE "public"."mini_livros"
DROP CONSTRAINT IF EXISTS "mini-livros_title_key";

ALTER TABLE "public"."mini_livros"
DROP CONSTRAINT IF EXISTS "mini_livros_title_key";

ALTER TABLE "public"."mini_livros"
DROP CONSTRAINT IF EXISTS "mini_livros_unique_title_per_part";

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "public"."ebooks"
        GROUP BY "order"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Cannot add ebooks_order_unique: duplicate ebooks.order values exist';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ebooks_order_unique'
    ) THEN
        ALTER TABLE "public"."ebooks"
        ADD CONSTRAINT "ebooks_order_unique"
        UNIQUE ("order");
    END IF;
END $$;
