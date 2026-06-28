CREATE TABLE IF NOT EXISTS public.site_bg (
    id   INTEGER PRIMARY KEY DEFAULT 1,
    data JSONB   NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT site_bg_singleton CHECK (id = 1)
);
