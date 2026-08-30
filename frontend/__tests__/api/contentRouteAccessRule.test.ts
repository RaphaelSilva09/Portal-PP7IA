import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockGetUser, mockExecuteListing, mockGetLastUpdated, mockGetNewslettersUseCase } = vi.hoisted(() => ({
    mockGetUser: vi.fn(),
    mockExecuteListing: vi.fn(),
    mockGetLastUpdated: vi.fn().mockResolvedValue(null),
    mockGetNewslettersUseCase: vi.fn(),
}));

vi.mock("@/infrastructure/auth/getUser", () => ({ getUser: mockGetUser }));
vi.mock("@/infrastructure/di/container", () => ({
    default: {
        getNewslettersUseCase: mockGetNewslettersUseCase,
        getContentAccessRulesForListingUseCase: () => ({ execute: mockExecuteListing }),
        getContentRepository: () => ({ getLastUpdated: mockGetLastUpdated }),
    },
}));

import { GET } from "@/app/api/content/[type]/route";

const lockedView = {
    ruleType: "requires_login",
    icon: "lock",
    cardLabel: "Faça login para acessar",
    modalTitle: "x",
    modalMessage: "x",
    unlockButtonLabel: "x",
    unlockAction: { kind: "open-auth-modal", mode: "login" },
};

function newsletterEntity() {
    // "props" existe aqui pelo mesmo motivo que numa instância real de
    // Newsletter: JSON.stringify serializa o campo de instância `props`
    // (não os getters) — reproduzido no mock pra bater com o formato real
    // tanto no caminho "sem regra encontrada" (devolve a entidade como
    // está, sem reconstruir) quanto no caminho "regra encontrada"
    // (reconstrói via Newsletter.create({...toObject(), accessRule})).
    const props = {
        id: 1,
        createdAt: new Date(),
        title: "PP-News #42",
        htmlPath: "newsletters/pp-news-42.html",
        pdfPath: null,
        readTime: 5,
        index: 1,
    };
    return {
        props,
        htmlPath: "/view/newsletter/pp-news-42",
        toObject: () => props,
    };
}

describe("GET /api/content/[type] — filtragem de accessRule por leitor", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetLastUpdated.mockResolvedValue(null);
        mockGetNewslettersUseCase.mockReturnValue({
            execute: vi.fn().mockResolvedValue({ latest: newsletterEntity(), older: [] }),
        });
    });

    it("leitor anônimo: item com regra requires_login aparece com accessRule (bloqueado)", async () => {
        mockGetUser.mockResolvedValue(null);
        mockExecuteListing.mockResolvedValue(new Map([["pp-news-42", lockedView]]));

        const response = await GET(new NextRequest("http://localhost/api/content/newsletter"), {
            params: Promise.resolve({ type: "newsletter" }),
        });
        const json = await response.json();

        expect(json.latest.props.accessRule).toEqual(lockedView);
        expect(mockExecuteListing).toHaveBeenCalledWith(
            "newsletter",
            ["pp-news-42"],
            { userId: null, role: null },
            { unfiltered: false },
        );
    });

    it("leitor logado (não-admin): NÃO aparece bloqueado — reproduz e fecha o bug reportado", async () => {
        mockGetUser.mockResolvedValue({ id: "user-1", email: "a@a.com", role: "user" });
        // O use case, já ciente do contexto, não devolveria a regra pra quem já passa nela.
        mockExecuteListing.mockResolvedValue(new Map());

        const response = await GET(new NextRequest("http://localhost/api/content/newsletter"), {
            params: Promise.resolve({ type: "newsletter" }),
        });
        const json = await response.json();

        expect(json.latest.props.accessRule ?? null).toBeNull();
        expect(mockExecuteListing).toHaveBeenCalledWith(
            "newsletter",
            ["pp-news-42"],
            { userId: "user-1", role: "user" },
            { unfiltered: false },
        );
    });

    it("admin navegando /explorar normalmente (sem ?scope=admin): não pede visão sem filtro", async () => {
        mockGetUser.mockResolvedValue({ id: "admin-1", email: "a@a.com", role: "admin" });
        mockExecuteListing.mockResolvedValue(new Map());

        await GET(new NextRequest("http://localhost/api/content/newsletter"), {
            params: Promise.resolve({ type: "newsletter" }),
        });

        expect(mockExecuteListing).toHaveBeenCalledWith(
            "newsletter",
            ["pp-news-42"],
            { userId: "admin-1", role: "admin" },
            { unfiltered: false },
        );
    });

    it("admin com ?scope=admin (painel admin): pede a visão sem filtro", async () => {
        mockGetUser.mockResolvedValue({ id: "admin-1", email: "a@a.com", role: "admin" });
        mockExecuteListing.mockResolvedValue(new Map([["pp-news-42", lockedView]]));

        const response = await GET(new NextRequest("http://localhost/api/content/newsletter?scope=admin"), {
            params: Promise.resolve({ type: "newsletter" }),
        });
        const json = await response.json();

        expect(json.latest.props.accessRule).toEqual(lockedView);
        expect(mockExecuteListing).toHaveBeenCalledWith(
            "newsletter",
            ["pp-news-42"],
            { userId: "admin-1", role: "admin" },
            { unfiltered: true },
        );
    });

    it("?scope=admin sem sessão de admin de verdade é ignorado (não vira unfiltered)", async () => {
        mockGetUser.mockResolvedValue({ id: "user-1", email: "a@a.com", role: "user" });
        mockExecuteListing.mockResolvedValue(new Map());

        await GET(new NextRequest("http://localhost/api/content/newsletter?scope=admin"), {
            params: Promise.resolve({ type: "newsletter" }),
        });

        expect(mockExecuteListing).toHaveBeenCalledWith(
            "newsletter",
            ["pp-news-42"],
            { userId: "user-1", role: "user" },
            { unfiltered: false },
        );
    });
});
