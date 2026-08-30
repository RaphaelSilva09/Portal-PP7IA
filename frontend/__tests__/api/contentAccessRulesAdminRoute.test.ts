import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockGetSession, mockGetRule, mockExecuteUpsert, mockExecuteRemove } = vi.hoisted(() => ({
    mockGetSession: vi.fn(),
    mockGetRule: vi.fn(),
    mockExecuteUpsert: vi.fn(),
    mockExecuteRemove: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
    auth: { api: { getSession: mockGetSession } },
}));

vi.mock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/infrastructure/di/container", () => ({
    default: {
        getContentAccessRuleRepository: () => ({ getRule: mockGetRule }),
        getUpsertContentAccessRuleUseCase: () => ({ execute: mockExecuteUpsert }),
        getRemoveContentAccessRuleUseCase: () => ({ execute: mockExecuteRemove }),
    },
}));

const { GET, PUT, DELETE } = await import("@/app/api/admin/content-access-rules/[type]/[slug]/route");

function putRequest(body: unknown): NextRequest {
    return new NextRequest("http://localhost/api/admin/content-access-rules/newsletter/pp-news-42", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

const params = Promise.resolve({ type: "newsletter", slug: "pp-news-42" });

describe("admin content-access-rules route", () => {
    beforeEach(() => {
        mockGetSession.mockReset();
        mockGetRule.mockReset();
        mockExecuteUpsert.mockReset();
        mockExecuteRemove.mockReset();
        mockExecuteUpsert.mockResolvedValue(undefined);
        mockExecuteRemove.mockResolvedValue(undefined);
    });

    it("GET sem sessão de admin retorna 403", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1", role: "user" } });
        const response = await GET(new NextRequest("http://localhost/x"), { params });
        expect(response.status).toBe(403);
        expect(mockGetRule).not.toHaveBeenCalled();
    });

    it("GET sem sessão nenhuma retorna 403", async () => {
        mockGetSession.mockResolvedValue(null);
        const response = await GET(new NextRequest("http://localhost/x"), { params });
        expect(response.status).toBe(403);
    });

    it("GET com sessão de admin devolve a regra salva", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "admin-1", role: "admin" } });
        mockGetRule.mockResolvedValue({
            contentType: "newsletter",
            slug: "pp-news-42",
            ruleType: "requires_login",
            params: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const response = await GET(new NextRequest("http://localhost/x"), { params });
        const json = await response.json();

        expect(json.rule).toEqual({ ruleType: "requires_login", params: {} });
    });

    it("GET com sessão de admin e sem regra salva devolve rule: null", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "admin-1", role: "admin" } });
        mockGetRule.mockResolvedValue(null);

        const response = await GET(new NextRequest("http://localhost/x"), { params });
        const json = await response.json();

        expect(json.rule).toBeNull();
    });

    it("PUT sem sessão de admin retorna 403 e não grava", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1", role: "user" } });
        const response = await PUT(putRequest({ ruleType: "requires_login" }), { params });

        expect(response.status).toBe(403);
        expect(mockExecuteUpsert).not.toHaveBeenCalled();
    });

    it("PUT com sessão de admin grava a regra", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "admin-1", role: "admin" } });

        const response = await PUT(putRequest({ ruleType: "requires_login", params: { x: 1 } }), { params });

        expect(response.status).toBe(200);
        expect(mockExecuteUpsert).toHaveBeenCalledWith({
            contentType: "newsletter",
            slug: "pp-news-42",
            ruleType: "requires_login",
            params: { x: 1 },
        });
    });

    it("PUT com payload sem ruleType retorna 400 e não grava", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "admin-1", role: "admin" } });

        const response = await PUT(putRequest({}), { params });

        expect(response.status).toBe(400);
        expect(mockExecuteUpsert).not.toHaveBeenCalled();
    });

    it("PUT com ruleType desconhecido (rejeitado pelo caso de uso) retorna 400", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "admin-1", role: "admin" } });
        mockExecuteUpsert.mockRejectedValueOnce(new Error("Tipo de regra de acesso desconhecido: x"));

        const response = await PUT(putRequest({ ruleType: "x" }), { params });

        expect(response.status).toBe(400);
    });

    it("DELETE sem sessão de admin retorna 403 e não remove", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1", role: "user" } });
        const response = await DELETE(new NextRequest("http://localhost/x", { method: "DELETE" }), { params });

        expect(response.status).toBe(403);
        expect(mockExecuteRemove).not.toHaveBeenCalled();
    });

    it("DELETE com sessão de admin remove a regra", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "admin-1", role: "admin" } });
        const response = await DELETE(new NextRequest("http://localhost/x", { method: "DELETE" }), { params });

        expect(response.status).toBe(200);
        expect(mockExecuteRemove).toHaveBeenCalledWith("newsletter", "pp-news-42");
    });
});
