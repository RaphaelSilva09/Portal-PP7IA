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
        const { error: deleteError } = await this.supabase
            .from("rag_chunks")
            .delete()
            .eq("source_type", sourceType);
        if (deleteError) throw new Error(`replaceAllForSource: delete failed: ${deleteError.message}`);

        if (chunks.length === 0) return 0;

        const rows = chunks.map(c => ({
            source_type: c.source_type,
            source_id: c.source_id,
            chunk_index: c.chunk_index,
            content: c.content,
            embedding: c.embedding,
            metadata: c.metadata,
        }));

        // Insert in batches of 200 to stay within Postgrest payload limits
        const BATCH = 200;
        let inserted = 0;
        for (let i = 0; i < rows.length; i += BATCH) {
            const slice = rows.slice(i, i + BATCH);
            const { error } = await this.supabase.from("rag_chunks").insert(slice);
            if (error) throw new Error(`replaceAllForSource: insert failed: ${error.message}`);
            inserted += slice.length;
        }
        return inserted;
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
