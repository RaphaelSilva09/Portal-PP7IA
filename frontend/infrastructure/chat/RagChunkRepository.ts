import { pool } from "@/lib/db";
import type { EmbeddedChunk, RetrievedChunk } from "@/domain/chat/Chunk";

interface SearchOptions {
    sourceType: string;
    queryEmbedding: number[];
    topK: number;
}

interface ReplaceOptions {
    sourceType: string;
    chunks: EmbeddedChunk[];
}

interface ChunkRow {
    source_type: string;
    source_id: string;
    chunk_index: number;
    content: string;
    metadata: Record<string, unknown>;
    similarity?: number;
}

function toVectorLiteral(v: number[]): string {
    return `[${v.join(",")}]`;
}

export class RagChunkRepository {
    /** Atomically replace all chunks for a source_type. Single transaction. */
    async replaceAllForSource({ sourceType, chunks }: ReplaceOptions): Promise<number> {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(`DELETE FROM public.rag_chunks WHERE source_type = $1`, [sourceType]);

            if (chunks.length === 0) {
                await client.query("COMMIT");
                return 0;
            }

            // Bulk insert via UNNEST for one round-trip
            const insertSql = `
                INSERT INTO public.rag_chunks
                    (source_type, source_id, chunk_index, content, embedding, metadata)
                SELECT * FROM UNNEST(
                    $1::text[],
                    $2::text[],
                    $3::int[],
                    $4::text[],
                    $5::vector[],
                    $6::jsonb[]
                )
            `;
            const params = [
                chunks.map(c => c.source_type),
                chunks.map(c => c.source_id),
                chunks.map(c => c.chunk_index),
                chunks.map(c => c.content),
                chunks.map(c => toVectorLiteral(c.embedding)),
                chunks.map(c => JSON.stringify(c.metadata)),
            ];
            await client.query(insertSql, params);
            await client.query("COMMIT");
            return chunks.length;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err instanceof Error ? err : new Error(String(err));
        } finally {
            client.release();
        }
    }

    /**
     * Replace meta chunks for one parent source type.
     * Deletes meta_summary WHERE parent_source_type = X and meta_global WHERE slug = global_X,
     * then inserts the new chunks. Safe to call per-source without wiping other sources.
     */
    async replaceMetaForParentSource(parentSourceType: string, chunks: EmbeddedChunk[]): Promise<number> {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(
                `DELETE FROM public.rag_chunks
                 WHERE (source_type = 'meta_summary' AND metadata->>'parent_source_type' = $1)
                    OR (source_type = 'meta_global'  AND metadata->>'slug' = $2)
                    OR (source_type = 'meta_themes'  AND metadata->>'slug' = $3)`,
                [parentSourceType, `global_${parentSourceType}`, `themes_${parentSourceType}`],
            );

            if (chunks.length === 0) {
                await client.query("COMMIT");
                return 0;
            }

            const insertSql = `
                INSERT INTO public.rag_chunks
                    (source_type, source_id, chunk_index, content, embedding, metadata)
                SELECT * FROM UNNEST(
                    $1::text[], $2::text[], $3::int[], $4::text[], $5::vector[], $6::jsonb[]
                )
            `;
            await client.query(insertSql, [
                chunks.map(c => c.source_type),
                chunks.map(c => c.source_id),
                chunks.map(c => c.chunk_index),
                chunks.map(c => c.content),
                chunks.map(c => toVectorLiteral(c.embedding)),
                chunks.map(c => JSON.stringify(c.metadata)),
            ]);
            await client.query("COMMIT");
            return chunks.length;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err instanceof Error ? err : new Error(String(err));
        } finally {
            client.release();
        }
    }

    /** Fetch all chunks for a given source by slug (hybrid retrieval hit). */
    async findBySlug(sourceType: string, slug: string): Promise<RetrievedChunk[]> {
        const { rows } = await pool.query<ChunkRow>(
            `
            SELECT source_type, source_id, chunk_index, content, metadata
            FROM public.rag_chunks
            WHERE source_type = $1
              AND metadata->>'slug' = $2
            ORDER BY chunk_index ASC
            `,
            [sourceType, slug],
        );
        return rows.map(r => ({
            source_type: r.source_type,
            source_id: r.source_id,
            chunk_index: r.chunk_index,
            content: r.content,
            metadata: r.metadata as unknown as RetrievedChunk["metadata"],
            similarity: 1.0,
        }));
    }

    async findAllContentBySourceType(sourceType: string): Promise<{ content: string; title: string }[]> {
        const { rows } = await pool.query<{ content: string; metadata: Record<string, unknown> }>(
            `SELECT content, metadata FROM public.rag_chunks
             WHERE source_type = $1
             ORDER BY source_id, chunk_index`,
            [sourceType],
        );
        return rows.map(r => ({
            content: r.content,
            title: (r.metadata?.title as string) ?? (r.metadata?.parent_title as string) ?? "",
        }));
    }

    async searchSimilar({ sourceType, queryEmbedding, topK }: SearchOptions): Promise<RetrievedChunk[]> {
        const { rows } = await pool.query<ChunkRow>(
            `
            SELECT
                source_type,
                source_id,
                chunk_index,
                content,
                metadata,
                1 - (embedding <=> $2::vector) AS similarity
            FROM public.rag_chunks
            WHERE source_type = $1
            ORDER BY embedding <=> $2::vector
            LIMIT $3
            `,
            [sourceType, toVectorLiteral(queryEmbedding), topK],
        );
        return rows.map(r => ({
            source_type: r.source_type,
            source_id: r.source_id,
            chunk_index: r.chunk_index,
            content: r.content,
            metadata: r.metadata as unknown as RetrievedChunk["metadata"],
            similarity: r.similarity ?? 0,
        }));
    }
}
