import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const {
    mockResolveContentFilePath,
    mockGetUser,
    mockExecuteAccess,
    mockLaunch,
    mockNewPage,
    mockGoto,
    mockSetExtraHTTPHeaders,
    mockPdf,
    mockAddStyleTag,
    mockEvaluate,
    mockClose,
} = vi.hoisted(() => ({
    mockResolveContentFilePath: vi.fn(),
    mockGetUser: vi.fn(),
    mockExecuteAccess: vi.fn(),
    mockLaunch: vi.fn(),
    mockNewPage: vi.fn(),
    mockGoto: vi.fn(),
    mockSetExtraHTTPHeaders: vi.fn(),
    mockPdf: vi.fn(),
    mockAddStyleTag: vi.fn(),
    mockEvaluate: vi.fn(),
    mockClose: vi.fn(),
}));

vi.mock("@/lib/contentStorage", () => ({ resolveContentFilePath: mockResolveContentFilePath }));
vi.mock("@/infrastructure/auth/getUser", () => ({ getUser: mockGetUser }));
vi.mock("@/infrastructure/di/container", () => ({
    default: { getEvaluateContentAccessUseCase: () => ({ execute: mockExecuteAccess }) },
}));
// process.env.NODE_ENV é "test" durante a suíte, então a rota usa o branch de
// dev (import("puppeteer")), não o de produção (@sparticuz/chromium) — só
// esse módulo precisa de mock.
vi.mock("puppeteer", () => ({
    default: { launch: mockLaunch },
}));

import { GET } from "@/app/api/export-pdf/[type]/[slug]/route";

const genericView = {
    ruleType: "requires_login",
    icon: "lock",
    cardLabel: "x",
    modalTitle: "x",
    modalMessage: "x",
    unlockButtonLabel: "x",
    unlockAction: { kind: "open-auth-modal", mode: "login" },
};

describe("export-pdf route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetUser.mockResolvedValue(null);
        mockExecuteAccess.mockResolvedValue({ allowed: true });
        mockResolveContentFilePath.mockResolvedValue({ ok: true, absolutePath: "/x.html" });
        mockEvaluate.mockResolvedValue(undefined);
        mockPdf.mockResolvedValue(Buffer.from("pdf"));
        mockNewPage.mockResolvedValue({
            goto: mockGoto,
            setExtraHTTPHeaders: mockSetExtraHTTPHeaders,
            evaluate: mockEvaluate,
            addStyleTag: mockAddStyleTag,
            pdf: mockPdf,
        });
        mockLaunch.mockResolvedValue({ newPage: mockNewPage, close: mockClose });
    });

    it("bloqueado: devolve 403 sem sequer resolver o arquivo ou abrir o Chromium", async () => {
        mockExecuteAccess.mockResolvedValueOnce({ allowed: false, view: genericView });

        const response = await GET(new NextRequest("http://localhost/api/export-pdf/newsletter/pp-news-42"), {
            params: Promise.resolve({ type: "newsletter", slug: "pp-news-42" }),
        });

        expect(response.status).toBe(403);
        expect(mockResolveContentFilePath).not.toHaveBeenCalled();
        expect(mockLaunch).not.toHaveBeenCalled();
    });

    it("liberado: repassa o cookie da requisição original para a navegação interna do Chromium", async () => {
        const request = new NextRequest("http://localhost/api/export-pdf/newsletter/pp-news-42", {
            headers: { cookie: "better-auth.session=abc123" },
        });

        const response = await GET(request, { params: Promise.resolve({ type: "newsletter", slug: "pp-news-42" }) });

        expect(response.status).toBe(200);
        expect(mockSetExtraHTTPHeaders).toHaveBeenCalledWith({ cookie: "better-auth.session=abc123" });
    });

    it("sem cookie na requisição original, não chama setExtraHTTPHeaders", async () => {
        const request = new NextRequest("http://localhost/api/export-pdf/newsletter/pp-news-42");

        await GET(request, { params: Promise.resolve({ type: "newsletter", slug: "pp-news-42" }) });

        expect(mockSetExtraHTTPHeaders).not.toHaveBeenCalled();
    });

    it("liberado: usa userId/role de getUser() na checagem de acesso", async () => {
        mockGetUser.mockResolvedValueOnce({ id: "user-1", email: "a@a.com", role: "user" });

        await GET(new NextRequest("http://localhost/api/export-pdf/newsletter/pp-news-42"), {
            params: Promise.resolve({ type: "newsletter", slug: "pp-news-42" }),
        });

        expect(mockExecuteAccess).toHaveBeenCalledWith({
            contentType: "newsletter",
            slug: "pp-news-42",
            userId: "user-1",
            role: "user",
        });
    });
});
