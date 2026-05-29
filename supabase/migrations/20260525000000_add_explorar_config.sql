CREATE TABLE IF NOT EXISTS public.explorar_config (
    id   INTEGER PRIMARY KEY DEFAULT 1,
    data JSONB   NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT explorar_config_singleton CHECK (id = 1)
);
