-- RAG Chat — corpus chunks + per-user rate limit
-- Schema is portable: GRANT/RLS suit Supabase; ignore on plain Postgres.

CREATE EXTENSION IF NOT EXISTS vector;

-- Indexed corpus chunks (v1 = mini_livros only; schema supports more sources)
CREATE TABLE IF NOT EXISTS public.rag_chunks (
    id           bigserial PRIMARY KEY,
    source_type  text         NOT NULL,
    source_id    uuid         NOT NULL,
    chunk_index  int          NOT NULL,
    content      text         NOT NULL,
    embedding    vector(3072) NOT NULL,
    metadata     jsonb        NOT NULL DEFAULT '{}'::jsonb,
    created_at   timestamptz  NOT NULL DEFAULT now()
);

-- HNSW index intentionally omitted: pgvector caps `vector` type HNSW at 2000 dims;
-- our 3072-dim embeddings exceed it. For mini-livros corpus size (~hundreds of
-- chunks) sequential scan with cosine distance is fast enough. If corpus grows
-- significantly, switch column to halfvec(3072) and add hnsw on halfvec_cosine_ops.

CREATE INDEX IF NOT EXISTS rag_chunks_source
    ON public.rag_chunks (source_type, source_id);

-- Per-user daily rate limit (date-bucketed)
CREATE TABLE IF NOT EXISTS public.rag_usage (
    user_id    uuid NOT NULL,
    usage_date date NOT NULL DEFAULT current_date,
    count      int  NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, usage_date)
);

ALTER TABLE public.rag_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rag_usage_self ON public.rag_usage;
CREATE POLICY rag_usage_self
    ON public.rag_usage
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Grants — match patterns used by existing migrations
GRANT ALL ON TABLE public.rag_chunks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.rag_usage  TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.rag_chunks_id_seq TO anon, authenticated, service_role;
