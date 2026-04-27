-- Similarity search RPC for the RAG chat retrieval path.
-- Uses cosine distance (<=>) on the rag_chunks.embedding column.
CREATE OR REPLACE FUNCTION public.match_rag_chunks(
    p_source_type      text,
    p_query_embedding  vector(3072),
    p_top_k            int
)
RETURNS TABLE (
    id           bigint,
    source_type  text,
    source_id    uuid,
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
