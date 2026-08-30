import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { Readable } from "node:stream";

const { mockGetUser, mockExecuteAccess, mockStat, mockCreateReadStream } = vi.hoisted(() => ({
    mockGetUser: vi.fn(),
    mockExecuteAccess: vi.fn(),
    mockStat: vi.fn(),
    mockCreateReadStream: vi.fn(),
}));

vi.mock("@/infrastructure/auth/getUser", () => ({ getUser: mockGetUser }));
vi.mock("@/infrastructure/di/container", () => ({
    default: { getEvaluateContentAccessUseCase: () => ({ execute: mockExecuteAccess }) },
}));
vi.mock("node:fs", () => {
    const fsMock = { createReadStream: mockCreateReadStream, promises: { stat: mockStat } };
    return { ...fsMock, default: fsMock };
});

import { GET } from "@/app/api/files/[...path]/route";

/**
 * /api/files serve o MESMO arquivo físico que /api/proxy-html protege
 * (mesma convenção materiais/{folder}/{slug}.{html,pdf}) — sem a checagem
 * adicionada nesta feature, o bloqueio de acesso a conteúdo seria
 * contornável só trocando a URL para esta rota genérica de arquivos.
 */
describe("files route — bloqueio de conteúdo", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetUser.mockResolvedValue(null);
        mockExecuteAccess.mockResolvedValue({ allowed: true });
        mockStat.mockResolvedValue({ isFile: () => true, mtimeMs: 1, size: 10 });
        mockCreateReadStream.mockReturnValue(Readable.from(["conteudo"]));
    });

    it("HTML de conteúdo bloqueado sob materiais/{folder}/ retorna 403 sem ler o arquivo do disco", async () => {
        mockExecuteAccess.mockResolvedValueOnce({ allowed: false, view: {} });

        const response = await GET(new NextRequest("http://localhost/api/files/materiais/newsletters/pp-news-42.html"), {
            params: Promise.resolve({ path: ["materiais", "newsletters", "pp-news-42.html"] }),
        });

        expect(response.status).toBe(403);
        expect(mockStat).not.toHaveBeenCalled();
        expect(mockExecuteAccess).toHaveBeenCalledWith({
            contentType: "newsletter",
            slug: "pp-news-42",
            userId: null,
            role: null,
        });
    });

    it("PDF de conteúdo bloqueado, mesma pasta, também é bloqueado (mesmo buraco que o HTML)", async () => {
        mockExecuteAccess.mockResolvedValueOnce({ allowed: false, view: {} });

        const response = await GET(new NextRequest("http://localhost/api/files/materiais/newsletters/pp-news-42.pdf"), {
            params: Promise.resolve({ path: ["materiais", "newsletters", "pp-news-42.pdf"] }),
        });

        expect(response.status).toBe(403);
        expect(mockStat).not.toHaveBeenCalled();
    });

    it("HTML de conteúdo liberado (sem regra ou usuário autorizado) segue servido normalmente", async () => {
        const response = await GET(new NextRequest("http://localhost/api/files/materiais/newsletters/pp-news-42.html"), {
            params: Promise.resolve({ path: ["materiais", "newsletters", "pp-news-42.html"] }),
        });

        expect(response.status).toBe(200);
        expect(mockStat).toHaveBeenCalled();
    });

    it("pasta multi-segmento (mini-livro: materiais/mini-livros/mini/) também é checada, com o type certo", async () => {
        mockExecuteAccess.mockResolvedValueOnce({ allowed: false, view: {} });

        const response = await GET(new NextRequest("http://localhost/api/files/materiais/mini-livros/mini/foo.html"), {
            params: Promise.resolve({ path: ["materiais", "mini-livros", "mini", "foo.html"] }),
        });

        expect(response.status).toBe(403);
        expect(mockExecuteAccess).toHaveBeenCalledWith({
            contentType: "mini-livro",
            slug: "foo",
            userId: null,
            role: null,
        });
    });

    it("arquivo fora da convenção materiais/{folder}/{slug}.{html,pdf} (ex.: imagem) não passa pela checagem de acesso", async () => {
        const response = await GET(new NextRequest("http://localhost/api/files/materiais/covers/foo.jpg"), {
            params: Promise.resolve({ path: ["materiais", "covers", "foo.jpg"] }),
        });

        expect(mockExecuteAccess).not.toHaveBeenCalled();
        expect(response.status).toBe(200);
    });

    it("pasta de um tipo fora do escopo de bloqueio (ex.: ebook) não é checada por esta rota", async () => {
        const response = await GET(
            new NextRequest("http://localhost/api/files/materiais/mini-livros/ebook/foo/introducao_foo.html"),
            { params: Promise.resolve({ path: ["materiais", "mini-livros", "ebook", "foo", "introducao_foo.html"] }) },
        );

        expect(mockExecuteAccess).not.toHaveBeenCalled();
        expect(response.status).toBe(200);
    });

    it("liberado: usa userId/role de getUser() na checagem de acesso", async () => {
        mockGetUser.mockResolvedValueOnce({ id: "user-1", email: "a@a.com", role: "user" });

        await GET(new NextRequest("http://localhost/api/files/materiais/newsletters/pp-news-42.html"), {
            params: Promise.resolve({ path: ["materiais", "newsletters", "pp-news-42.html"] }),
        });

        expect(mockExecuteAccess).toHaveBeenCalledWith({
            contentType: "newsletter",
            slug: "pp-news-42",
            userId: "user-1",
            role: "user",
        });
    });
});
