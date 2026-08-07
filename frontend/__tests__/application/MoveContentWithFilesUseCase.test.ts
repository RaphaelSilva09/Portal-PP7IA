import { beforeEach, describe, expect, it, vi } from "vitest";
import { MoveContentWithFilesUseCase } from "@/application/usecases/MoveContentWithFilesUseCase";
import { ContentItem } from "@/domain/entities/ContentItem";
import type { ContentItemProps } from "@/domain/entities/ContentItem";

function makeContentItem(overrides: Partial<ContentItemProps> = {}): ContentItem {
    return ContentItem.create({
        id: 7,
        createdAt: new Date("2026-03-10T00:00:00.000Z"),
        title: "Conteúdo de teste",
        htmlPath: "/materiais/radar-de-oportunidades/007.html",
        pdfPath: null,
        readTime: 5,
        ...overrides,
    });
}

function makeMocks() {
    const contentRepository = {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        getLastUpdated: vi.fn(),
        reorderItems: vi.fn(),
        suppressDigestNotification: vi.fn().mockResolvedValue(undefined),
    };
    const storageRepository = {
        upload: vi.fn(),
        delete: vi.fn().mockResolvedValue(undefined),
        copy: vi.fn(),
    };
    return { contentRepository, storageRepository };
}

describe("MoveContentWithFilesUseCase", () => {
    let mocks: ReturnType<typeof makeMocks>;
    let useCase: MoveContentWithFilesUseCase;

    beforeEach(() => {
        mocks = makeMocks();
        useCase = new MoveContentWithFilesUseCase(mocks.contentRepository, mocks.storageRepository);
    });

    it("move para um bloco sem campo extra: copia HTML, preserva createdAt, apaga a origem", async () => {
        const source = makeContentItem();
        mocks.contentRepository.getById
            .mockResolvedValueOnce(source)
            .mockResolvedValueOnce(makeContentItem({ id: 14, htmlPath: "/materiais/estudar/014.html" }));
        mocks.contentRepository.create.mockResolvedValueOnce(makeContentItem({ id: 14, htmlPath: null, pdfPath: null }));
        mocks.storageRepository.copy.mockResolvedValueOnce({
            path: "materiais/estudar/014.html",
            publicUrl: "/api/files/materiais/estudar/014.html",
        });

        const result = await useCase.execute({ sourceType: "radar_oportunidades", id: 7, targetType: "estudar" });

        expect(mocks.contentRepository.create).toHaveBeenCalledWith("estudar", expect.objectContaining({
            title: "Conteúdo de teste",
            readTime: 5,
            createdAt: new Date("2026-03-10T00:00:00.000Z"),
        }));
        expect(mocks.contentRepository.suppressDigestNotification).toHaveBeenCalledWith("estudar", 14);
        expect(mocks.storageRepository.copy).toHaveBeenCalledWith(
            "materiais",
            "radar-de-oportunidades/007.html",
            "estudar/014.html",
        );
        expect(mocks.contentRepository.update).toHaveBeenCalledWith("estudar", 14, {
            htmlPath: "/materiais/estudar/014.html",
            pdfPath: null,
        });
        expect(mocks.storageRepository.delete).toHaveBeenCalledWith("materiais", "radar-de-oportunidades/007.html");
        expect(mocks.contentRepository.delete).toHaveBeenCalledWith("radar_oportunidades", 7);
        expect(result.id).toBe(14);
    });

    it("move para Biblioteca com tema fornecido no body", async () => {
        const source = makeContentItem({ htmlPath: null, pdfPath: null });
        mocks.contentRepository.getById
            .mockResolvedValueOnce(source)
            .mockResolvedValueOnce(makeContentItem({ id: 20, htmlPath: null, pdfPath: null, tema: "tecnologia" }));
        mocks.contentRepository.create.mockResolvedValueOnce(makeContentItem({ id: 20, htmlPath: null, pdfPath: null }));

        await useCase.execute({
            sourceType: "estudar",
            id: 7,
            targetType: "biblioteca",
            tema: "tecnologia",
        });

        expect(mocks.contentRepository.create).toHaveBeenCalledWith("biblioteca", expect.objectContaining({
            tema: "tecnologia",
        }));
        expect(mocks.storageRepository.copy).not.toHaveBeenCalled();
    });

    it("move para Mini-livro com ebookId e partOrder fornecidos", async () => {
        const source = makeContentItem({ htmlPath: null, pdfPath: null });
        mocks.contentRepository.getById
            .mockResolvedValueOnce(source)
            .mockResolvedValueOnce(makeContentItem({ id: 21, htmlPath: null, pdfPath: null }));
        mocks.contentRepository.create.mockResolvedValueOnce(makeContentItem({ id: 21, htmlPath: null, pdfPath: null }));

        await useCase.execute({
            sourceType: "estudar",
            id: 7,
            targetType: "mini-livro",
            ebookId: 3,
            partOrder: 2,
        });

        expect(mocks.contentRepository.create).toHaveBeenCalledWith("mini-livro", expect.objectContaining({
            ebookId: 3,
            partOrder: 2,
        }));
    });

    it("rejeita mover para Biblioteca sem tema — nada é criado", async () => {
        await expect(
            useCase.execute({ sourceType: "estudar", id: 7, targetType: "biblioteca" }),
        ).rejects.toThrow(/tema/i);

        expect(mocks.contentRepository.getById).not.toHaveBeenCalled();
        expect(mocks.contentRepository.create).not.toHaveBeenCalled();
    });

    it("rejeita mover para Mini-livro sem ebookId/partOrder — nada é criado", async () => {
        await expect(
            useCase.execute({ sourceType: "estudar", id: 7, targetType: "mini-livro" }),
        ).rejects.toThrow(/e-book/i);

        expect(mocks.contentRepository.create).not.toHaveBeenCalled();
    });

    it("rejeita destino igual à origem", async () => {
        await expect(
            useCase.execute({ sourceType: "estudar", id: 7, targetType: "estudar" }),
        ).rejects.toThrow();

        expect(mocks.contentRepository.create).not.toHaveBeenCalled();
    });

    it("rejeita ebook como destino", async () => {
        await expect(
            useCase.execute({ sourceType: "estudar", id: 7, targetType: "ebook" }),
        ).rejects.toThrow();

        expect(mocks.contentRepository.create).not.toHaveBeenCalled();
    });

    it("lança erro quando o item de origem não existe", async () => {
        mocks.contentRepository.getById.mockResolvedValueOnce(null);

        await expect(
            useCase.execute({ sourceType: "estudar", id: 999, targetType: "newsletter" }),
        ).rejects.toThrow(/não encontrado/i);

        expect(mocks.contentRepository.create).not.toHaveBeenCalled();
    });

    it("reverte a linha nova e o arquivo já copiado se a cópia do PDF falhar", async () => {
        const source = makeContentItem({
            htmlPath: "/materiais/radar-de-oportunidades/007.html",
            pdfPath: "/materiais/radar-de-oportunidades/007.pdf",
        });
        mocks.contentRepository.getById.mockResolvedValueOnce(source);
        mocks.contentRepository.create.mockResolvedValueOnce(makeContentItem({ id: 14, htmlPath: null, pdfPath: null }));
        mocks.storageRepository.copy
            .mockResolvedValueOnce({ path: "materiais/estudar/014.html", publicUrl: "/api/files/materiais/estudar/014.html" })
            .mockRejectedValueOnce(new Error("disco cheio"));

        await expect(
            useCase.execute({ sourceType: "radar_oportunidades", id: 7, targetType: "estudar" }),
        ).rejects.toThrow(/Falha ao mover/i);

        expect(mocks.storageRepository.delete).toHaveBeenCalledWith("materiais", "estudar/014.html");
        expect(mocks.contentRepository.delete).toHaveBeenCalledWith("estudar", 14);
        expect(mocks.contentRepository.delete).not.toHaveBeenCalledWith("radar_oportunidades", 7);
        expect(mocks.contentRepository.update).not.toHaveBeenCalled();
    });
});
