-- Atomic corpus rebuild for the RAG chat reindex flow.
-- Replaces the prior delete-then-loop-insert pattern in the JS client,
-- which could leave the corpus in a torn state if any insert batch failed.
CREATE OR REPLACE FUNCTION public.replace_rag_chunks(
    p_source_type text,
    p_chunks      jsonb
) RETURNS int
LANGUAGE plpgsql AS $$
DECLARE
    inserted_count int;
BEGIN
    DELETE FROM public.rag_chunks WHERE source_type = p_source_type;

    INSERT INTO public.rag_chunks (source_type, source_id, chunk_index, content, embedding, metadata)
    SELECT
        c->>'source_type',
        c->>'source_id',
        (c->>'chunk_index')::int,
        c->>'content',
        (c->>'embedding')::vector(3072),
        COALESCE(c->'metadata', '{}'::jsonb)
    FROM jsonb_array_elements(p_chunks) AS c;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RETURN inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.replace_rag_chunks(text, jsonb)
    TO service_role;
