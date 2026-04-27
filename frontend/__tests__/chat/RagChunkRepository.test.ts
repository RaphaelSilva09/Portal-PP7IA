import { describe, it, expect, vi, beforeEach } from "vitest";
import { RagChunkRepository } from "@/infrastructure/chat/RagChunkRepository";
import type { SupabaseClient } from "@supabase/supabase-js";

function mockClient(overrides: Partial<{ delete: unknown; insert: unknown; rpc: unknown }> = {}) {
    const tableMock = {
        delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        insert: vi.fn().mockResolvedValue({ error: null }),
    };
    const rpcMock = vi.fn().mockResolvedValue({ data: [], error: null });
    return {
        from: vi.fn().mockReturnValue(tableMock),
        rpc: rpcMock,
        ...overrides,
    } as unknown as SupabaseClient;
}

describe("RagChunkRepository", () => {
    beforeEach(() => vi.clearAllMocks());

    it("replaceAllForSource: deletes then inserts chunks", async () => {
        const client = mockClient();
        const repo = new RagChunkRepository(client);

        const inserted = await repo.replaceAllForSource({
            sourceType: "mini_livro",
            chunks: [{
                source_type: "mini_livro",
                source_id: "00000000-0000-0000-0000-000000000001",
                chunk_index: 0,
                content: "hi",
                embedding: Array(3072).fill(0),
                metadata: { heading_path: ["A"], slug: "x", title: "X", char_start: 0, char_end: 2 },
            }],
        });

        expect(inserted).toBe(1);
        expect(client.from).toHaveBeenCalledWith("rag_chunks");
    });

    it("replaceAllForSource: returns 0 when no chunks (still deletes)", async () => {
        const client = mockClient();
        const repo = new RagChunkRepository(client);
        const inserted = await repo.replaceAllForSource({ sourceType: "mini_livro", chunks: [] });
        expect(inserted).toBe(0);
    });

    it("searchSimilar: maps RPC rows to RetrievedChunk", async () => {
        const client = mockClient({
            rpc: vi.fn().mockResolvedValue({
                data: [{
                    source_type: "mini_livro",
                    source_id: "00000000-0000-0000-0000-000000000001",
                    chunk_index: 0,
                    content: "answer",
                    metadata: { heading_path: ["A"], slug: "x", title: "X", char_start: 0, char_end: 6 },
                    similarity: 0.7,
                }],
                error: null,
            }),
        });
        const repo = new RagChunkRepository(client);
        const result = await repo.searchSimilar({
            sourceType: "mini_livro",
            queryEmbedding: Array(3072).fill(0),
            topK: 6,
        });
        expect(result).toHaveLength(1);
        expect(result[0].similarity).toBe(0.7);
        expect(result[0].metadata.slug).toBe("x");
    });
});
