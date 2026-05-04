import { describe, it, expect, vi, beforeEach } from "vitest";
import { RateLimitRepository } from "@/infrastructure/chat/RateLimitRepository";
import type { SupabaseClient } from "@supabase/supabase-js";

function mockClient(opts: { count?: number | null; error?: { message: string } | null; rpcError?: { message: string } | null } = {}) {
    const maybeSingle = vi.fn().mockResolvedValue({
        data: opts.count != null ? { count: opts.count } : null,
        error: opts.error ?? null,
    });
    const eq2 = vi.fn().mockReturnValue({ maybeSingle });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const select = vi.fn().mockReturnValue({ eq: eq1 });
    const rpc = vi.fn().mockResolvedValue({ error: opts.rpcError ?? null });
    return { from: vi.fn().mockReturnValue({ select }), rpc } as unknown as SupabaseClient;
}

describe("RateLimitRepository", () => {
    beforeEach(() => vi.clearAllMocks());

    it("currentCount returns 0 when no row exists", async () => {
        const repo = new RateLimitRepository(mockClient({ count: null }));
        expect(await repo.currentCount("u1")).toBe(0);
    });

    it("currentCount returns the row count when present", async () => {
        const repo = new RateLimitRepository(mockClient({ count: 5 }));
        expect(await repo.currentCount("u1")).toBe(5);
    });

    it("increment calls bump_rag_usage RPC", async () => {
        const client = mockClient();
        const repo = new RateLimitRepository(client);
        await repo.increment("user-id-123");
        expect(client.rpc).toHaveBeenCalledWith("bump_rag_usage", expect.objectContaining({
            p_user_id: "user-id-123",
        }));
    });

    it("currentCount throws on error", async () => {
        const repo = new RateLimitRepository(mockClient({ error: { message: "boom" } }));
        await expect(repo.currentCount("u1")).rejects.toThrow(/boom/);
    });
});
