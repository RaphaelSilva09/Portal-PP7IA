import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockResolveContentFilePath, mockGetUser, mockExecuteAccess } = vi.hoisted(() => ({
    mockResolveContentFilePath: vi.fn(),
    mockGetUser: vi.fn(),
    mockExecuteAccess: vi.fn(),
}));

vi.mock("@/lib/contentStorage", () => ({
    resolveContentFilePath: mockResolveContentFilePath,
}));

vi.mock("@/infrastructure/auth/getUser", () => ({
    getUser: mockGetUser,
}));

vi.mock("@/infrastructure/di/container", () => ({
    default: {
        getEvaluateContentAccessUseCase: () => ({ execute: mockExecuteAccess }),
    },
}));

import { GET, HEAD } from "@/app/api/proxy-html/[type]/[slug]/route";

describe("proxy HTML route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetUser.mockResolvedValue(null);
        mockExecuteAccess.mockResolvedValue({ allowed: true });
    });

    describe("HEAD", () => {
        it("confirms uploaded radar HTML exists without reading the file body", async () => {
            mockResolveContentFilePath.mockResolvedValueOnce({
                ok: true,
                absolutePath: "/storage/materiais/radar-de-oportunidades/001.html",
            });

            const response = await HEAD(new NextRequest("http://localhost/api/proxy-html/radar_oportunidades/001"), {
                params: Promise.resolve({ type: "radar_oportunidades", slug: "001" }),
            });

            expect(response.status).toBe(200);
        });

        it("preserves missing-file status for unavailable content", async () => {
            mockResolveContentFilePath.mockResolvedValueOnce({
                ok: false,
                status: 404,
                error: "Arquivo não encontrado",
            });

            const response = await HEAD(new NextRequest("http://localhost/api/proxy-html/radar_oportunidades/001"), {
                params: Promise.resolve({ type: "radar_oportunidades", slug: "001" }),
            });

            expect(response.status).toBe(404);
        });

        it("bloqueado: devolve 403 SEM checar o arquivo no storage — o bloqueio de acesso vem antes da existência do arquivo", async () => {
            mockExecuteAccess.mockResolvedValueOnce({
                allowed: false,
                view: { ruleType: "requires_login", icon: "lock", cardLabel: "x", modalTitle: "x", modalMessage: "x", unlockButtonLabel: "x", unlockAction: { kind: "open-auth-modal", mode: "login" } },
            });

            const response = await HEAD(new NextRequest("http://localhost/api/proxy-html/newsletter/pp-news-42"), {
                params: Promise.resolve({ type: "newsletter", slug: "pp-news-42" }),
            });

            expect(response.status).toBe(403);
            expect(mockResolveContentFilePath).not.toHaveBeenCalled();
        });

        it("bloqueado: o DTO completo chega via header X-Access-Rule mesmo sem corpo (HEAD)", async () => {
            const view = { ruleType: "requires_login", icon: "lock", cardLabel: "x", modalTitle: "x", modalMessage: "x", unlockButtonLabel: "x", unlockAction: { kind: "open-auth-modal", mode: "login" } };
            mockExecuteAccess.mockResolvedValueOnce({ allowed: false, view });

            const response = await HEAD(new NextRequest("http://localhost/api/proxy-html/newsletter/pp-news-42"), {
                params: Promise.resolve({ type: "newsletter", slug: "pp-news-42" }),
            });

            const header = response.headers.get("X-Access-Rule");
            expect(header).not.toBeNull();
            expect(JSON.parse(decodeURIComponent(header!))).toEqual(view);
        });
    });

    describe("GET", () => {
        it("bloqueado: devolve 403 e nunca lê o arquivo do storage", async () => {
            mockExecuteAccess.mockResolvedValueOnce({
                allowed: false,
                view: { ruleType: "requires_login", icon: "lock", cardLabel: "x", modalTitle: "x", modalMessage: "x", unlockButtonLabel: "x", unlockAction: { kind: "open-auth-modal", mode: "login" } },
            });

            const response = await GET(new NextRequest("http://localhost/api/proxy-html/newsletter/pp-news-42"), {
                params: Promise.resolve({ type: "newsletter", slug: "pp-news-42" }),
            });

            expect(response.status).toBe(403);
            expect(mockResolveContentFilePath).not.toHaveBeenCalled();
            const json = await response.json();
            expect(json.accessRule.ruleType).toBe("requires_login");
        });

        it("liberado: passa a checagem de acesso o userId/role vindos de getUser()", async () => {
            mockGetUser.mockResolvedValueOnce({ id: "user-1", email: "a@a.com", role: "admin" });
            mockResolveContentFilePath.mockResolvedValueOnce({ ok: false, status: 404, error: "Arquivo não encontrado" });

            await GET(new NextRequest("http://localhost/api/proxy-html/newsletter/pp-news-42"), {
                params: Promise.resolve({ type: "newsletter", slug: "pp-news-42" }),
            });

            expect(mockExecuteAccess).toHaveBeenCalledWith({
                contentType: "newsletter",
                slug: "pp-news-42",
                userId: "user-1",
                role: "admin",
            });
        });
    });
});
