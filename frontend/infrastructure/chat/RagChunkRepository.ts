// frontend/infrastructure/chat/RagChunkRepository.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { EmbeddedChunk, RetrievedChunk } from "@/domain/chat/Chunk";
import { getServiceRoleClient } from "./serviceRoleClient";

interface SearchOptions {
    sourceType: string;
    queryEmbedding: number[];
    topK: number;
}

interface ReplaceOptions {
    sourceType: string;
    chunks: EmbeddedChunk[];
}

export class RagChunkRepository {
    constructor(private readonly supabase: SupabaseClient = getServiceRoleClient()) {}

    /** Atomically replace all chunks for a source_type. */
    async replaceAllForSource({ sourceType, chunks }: ReplaceOptions): Promise<number> {
        // Edge case: empty corpus still wipes existing chunks for this source.
        if (chunks.length === 0) {
            const { error } = await this.supabase
                .from("rag_chunks")
                .delete()
                .eq("source_type", sourceType);
            if (error) throw new Error(`replaceAllForSource: delete failed: ${error.message}`);
            return 0;
        }

        const payload = chunks.map(c => ({
            source_type: c.source_type,
            source_id: c.source_id,
            chunk_index: c.chunk_index,
            content: c.content,
            // pgvector accepts string '[a,b,c,...]' literal — JSON-serialize the array
            embedding: `[${c.embedding.join(",")}]`,
            metadata: c.metadata,
        }));

        const { data, error } = await this.supabase.rpc("replace_rag_chunks", {
            p_source_type: sourceType,
            p_chunks: payload,
        });
        if (error) throw new Error(`replaceAllForSource: ${error.message}`);
        return typeof data === "number" ? data : 0;
    }

    /** Fetch all chunks for a given source by slug. Used for "what's in mini-livro N" queries. */
    async findBySlug(sourceType: string, slug: string): Promise<RetrievedChunk[]> {
        const { data, error } = await this.supabase
            .from("rag_chunks")
            .select("source_type, source_id, chunk_index, content, metadata")
            .eq("source_type", sourceType)
            .eq("metadata->>slug", slug)
            .order("chunk_index", { ascending: true });
        if (error) throw new Error(`findBySlug: ${error.message}`);
        return (data ?? []).map(r => ({
            source_type: r.source_type,
            source_id: r.source_id,
            chunk_index: r.chunk_index,
            content: r.content,
            metadata: r.metadata as RetrievedChunk["metadata"],
            similarity: 1.0, // hybrid hit — treat as max relevance
        }));
    }

    async searchSimilar({ sourceType, queryEmbedding, topK }: SearchOptions): Promise<RetrievedChunk[]> {
        const { data, error } = await this.supabase.rpc("match_rag_chunks", {
            p_source_type: sourceType,
            p_query_embedding: queryEmbedding,
            p_top_k: topK,
        });
        if (error) throw new Error(`searchSimilar: ${error.message}`);
        return (data ?? []).map((r: {
            source_type: string;
            source_id: string;
            chunk_index: number;
            content: string;
            metadata: Record<string, unknown>;
            similarity: number;
        }) => ({
            source_type: r.source_type,
            source_id: r.source_id,
            chunk_index: r.chunk_index,
            content: r.content,
            metadata: r.metadata as unknown as RetrievedChunk["metadata"],
            similarity: r.similarity,
        }));
    }
}
