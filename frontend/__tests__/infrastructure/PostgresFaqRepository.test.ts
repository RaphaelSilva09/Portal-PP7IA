import { describe, expect, it, vi, beforeEach } from "vitest";

const queryMock = vi.fn();

vi.mock("@/lib/db", () => ({
    pool: { query: queryMock },
}));

const { PostgresFaqRepository } = await import("@/infrastructure/repositories/PostgresFaqRepository");

describe("PostgresFaqRepository", () => {
    beforeEach(() => {
        queryMock.mockReset();
    });

    it("getAll retorna array vazio quando a coleção está genuinamente vazia", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        const repo = new PostgresFaqRepository();
        const items = await repo.getAll();

        expect(items).toEqual([]);
    });

    it("getAll propaga o erro em vez de mascarar falha de banco como coleção vazia", async () => {
        queryMock.mockRejectedValue(new Error("connection refused"));

        const repo = new PostgresFaqRepository();

        await expect(repo.getAll()).rejects.toThrow("connection refused");
    });
});
