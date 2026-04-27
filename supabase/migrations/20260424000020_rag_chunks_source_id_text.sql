-- Change rag_chunks.source_id from uuid to text.
-- Different ContentSource adapters use different ID shapes:
--   mini_livros.id is bigint (cast to numeric string in TS)
--   biblioteca/portal_news/etc. use uuid
-- Storing as text accepts both without forcing per-source coercion.

-- The match_rag_chunks RPC also needs its return type updated.
DROP FUNCTION IF EXISTS public.match_rag_chunks(text, vector, int);

ALTER TABLE public.rag_chunks
    ALTER COLUMN source_id TYPE text USING source_id::text;

CREATE OR REPLACE FUNCTION public.match_rag_chunks(
    p_source_type      text,
    p_query_embedding  vector(3072),
    p_top_k            int
)
RETURNS TABLE (
    id           bigint,
    source_type  text,
    source_id    text,
    chunk_index  int,
    content      text,
    metadata     jsonb,
    similarity   double precision
)
LANGUAGE sql STABLE AS $$
    SELECT
        c.id, c.source_type, c.source_id, c.chunk_index, c.content, c.metadata,
        1 - (c.embedding <=> p_query_embedding) AS similarity
    FROM public.rag_chunks c
    WHERE c.source_type = p_source_type
    ORDER BY c.embedding <=> p_query_embedding
    LIMIT p_top_k;
$$;

GRANT EXECUTE ON FUNCTION public.match_rag_chunks(text, vector, int)
    TO anon, authenticated, service_role;
