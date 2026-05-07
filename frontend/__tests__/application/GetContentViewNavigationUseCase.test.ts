import { describe, expect, it, vi, beforeEach } from "vitest";
import { GetContentViewNavigationUseCase } from "@/application/usecases/GetContentViewNavigationUseCase";
import { Book } from "@/domain/entities/Book";
import type { BookProps } from "@/domain/entities/Book";
import { Newsletter } from "@/domain/entities/Newsletter";
import type { NewsletterProps } from "@/domain/entities/Newsletter";
import { BibliotecaItem } from "@/domain/entities/BibliotecaItem";
import type { BibliotecaItemProps } from "@/domain/entities/BibliotecaItem";
import { MiniLivro } from "@/domain/entities/MiniLivro";
import type { MiniLivroProps } from "@/domain/entities/MiniLivro";
import { MiniLivroSection } from "@/domain/entities/MiniLivroSection";
import type { MiniLivroSectionProps } from "@/domain/entities/MiniLivroSection";
import { Ebook } from "@/domain/entities/Ebook";
import type { EbookProps } from "@/domain/entities/Ebook";

const dependencies = {
    bookRepository: { getActiveBook: vi.fn() },
    newsletterRepository: { getAll: vi.fn() },
    miniLivroRepository: { getAll: vi.fn() },
    miniLivroSectionRepository: { getAll: vi.fn() },
    bibliotecaRepository: { getAll: vi.fn() },
    especialSemanaRepository: { getAll: vi.fn() },
    radarOportunidadesRepository: { getAll: vi.fn() },
    estudarRepository: { getAll: vi.fn() },
    ebookRepository: { getAll: vi.fn() },
};

const useCase = new GetContentViewNavigationUseCase(dependencies);

function makeNewsletter(overrides: Partial<NewsletterProps> = {}) {
    return Newsletter.create({
        id: 1,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        title: "Newsletter 1",
        htmlPath: "/materiais/newsletters/001.html",
        pdfPath: null,
        readTime: 5,
        index: 1,
        ...overrides,
    });
}

function makeBook(overrides: Partial<BookProps> = {}) {
    return Book.create({
        id: 1,
        title: "Livro principal",
        subtitle: null,
        description: null,
        coverImagePath: null,
        coverPdfPath: null,
        introHtmlPath: "/materiais/mini-livros/livro/introducao-livro.html",
        introPdfPath: null,
        badgeText: null,
        isActive: true,
        ...overrides,
    });
}

function makeBiblioteca(overrides: Partial<BibliotecaItemProps> = {}) {
    return BibliotecaItem.create({
        id: 1,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        title: "Biblioteca 1",
        htmlPath: "/materiais/biblioteca/001.html",
        pdfPath: null,
        readTime: 5,
        tema: "tecnologia",
        index: 1,
        ...overrides,
    });
}

function makeMiniLivro(overrides: Partial<MiniLivroProps> = {}) {
    return MiniLivro.create({
        id: 1,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        title: "Mini-livro 1",
        htmlPath: "/materiais/mini-livros/001.html",
        pdfPath: null,
        readTime: 5,
        ebookId: 1,
        index: 1,
        partOrder: 1,
        ...overrides,
    });
}

function makeEbook(overrides: Partial<EbookProps> = {}) {
    return Ebook.create({
        id: 1,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        title: "E-book 1",
        subtitle: null,
        description: null,
        coverImagePath: null,
        coverPdfPath: null,
        introHtmlPath: "/materiais/mini-livros/ebook/parte-1/introducao_parte-1.html",
        introPdfPath: null,
        badgeText: null,
        readTime: 5,
        order: 1,
        ...overrides,
    });
}

function makeMiniLivroSection(overrides: Partial<MiniLivroSectionProps> = {}) {
    return MiniLivroSection.create({
        id: 1,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        kind: "introducao",
        title: "Introdução",
        description: "Texto inicial",
        htmlPath: "/materiais/mini-livros/sections/introducao/1.html",
        index: 1,
        ...overrides,
    });
}

describe("GetContentViewNavigationUseCase", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        dependencies.bookRepository.getActiveBook.mockResolvedValue(null);
        dependencies.newsletterRepository.getAll.mockResolvedValue([]);
        dependencies.miniLivroRepository.getAll.mockResolvedValue([]);
        dependencies.miniLivroSectionRepository.getAll.mockResolvedValue([]);
        dependencies.bibliotecaRepository.getAll.mockResolvedValue([]);
        dependencies.especialSemanaRepository.getAll.mockResolvedValue([]);
        dependencies.radarOportunidadesRepository.getAll.mockResolvedValue([]);
        dependencies.estudarRepository.getAll.mockResolvedValue([]);
        dependencies.ebookRepository.getAll.mockResolvedValue([]);
    });

    it("ordena newsletters por index e desempata por id", async () => {
        dependencies.newsletterRepository.getAll.mockResolvedValue([
            makeNewsletter({ id: 30, title: "Terceira", htmlPath: "/materiais/newsletters/terceira.html", index: 3 }),
            makeNewsletter({ id: 20, title: "Segunda A", htmlPath: "/materiais/newsletters/segunda-a.html", index: 2 }),
            makeNewsletter({ id: 10, title: "Primeira", htmlPath: "/materiais/newsletters/primeira.html", index: 1 }),
            makeNewsletter({ id: 21, title: "Segunda B", htmlPath: "/materiais/newsletters/segunda-b.html", index: 2 }),
        ]);

        const result = await useCase.execute({ type: "newsletter", slug: "segunda-b" });

        expect(result.current?.title).toBe("Segunda B");
        expect(result.previous?.title).toBe("Segunda A");
        expect(result.next?.title).toBe("Terceira");
    });

    it("restringe biblioteca ao mesmo tema", async () => {
        dependencies.bibliotecaRepository.getAll.mockResolvedValue([
            makeBiblioteca({ id: 1, title: "Tech 1", htmlPath: "/materiais/biblioteca/tech-1.html", tema: "tecnologia", index: 1 }),
            makeBiblioteca({ id: 2, title: "Saúde 1", htmlPath: "/materiais/biblioteca/saude-1.html", tema: "saude", index: 1 }),
            makeBiblioteca({ id: 3, title: "Tech 2", htmlPath: "/materiais/biblioteca/tech-2.html", tema: "tecnologia", index: 2 }),
        ]);

        const result = await useCase.execute({ type: "biblioteca", slug: "tech-2" });

        expect(result.previous?.title).toBe("Tech 1");
        expect(result.next).toBeNull();
    });

    it("liga a introdução do livro à introdução da primeira parte", async () => {
        dependencies.bookRepository.getActiveBook.mockResolvedValue(makeBook());
        dependencies.ebookRepository.getAll.mockResolvedValue([
            makeEbook({ id: 1, title: "Parte I", introHtmlPath: "/materiais/mini-livros/ebook/parte-i/introducao_parte-i.html", order: 1 }),
        ]);

        const result = await useCase.execute({ type: "book", slug: "introducao-livro" });

        expect(result.previous).toBeNull();
        expect(result.next?.title).toBe("Parte I");
        expect(result.next?.href).toBe("/view/ebook/parte-i");
    });

    it("leva da introdução da parte para o primeiro capítulo da mesma parte", async () => {
        dependencies.ebookRepository.getAll.mockResolvedValue([
            makeEbook({ id: 1, title: "Parte I", introHtmlPath: "/materiais/mini-livros/ebook/parte-i/introducao_parte-i.html", order: 1 }),
        ]);
        dependencies.miniLivroRepository.getAll.mockResolvedValue([
            makeMiniLivro({ id: 1, title: "Parte 1 - A", htmlPath: "/materiais/mini-livros/parte-1-a.html", index: 1, partOrder: 1 }),
            makeMiniLivro({ id: 2, title: "Parte 1 - B", htmlPath: "/materiais/mini-livros/parte-1-b.html", index: 2, partOrder: 1 }),
        ]);

        const result = await useCase.execute({ type: "ebook", slug: "parte-i" });

        expect(result.previous).toBeNull();
        expect(result.next?.title).toBe("Parte 1 - A");
    });

    it("liga o livro à introdução quando ela existe", async () => {
        dependencies.bookRepository.getActiveBook.mockResolvedValue(makeBook());
        dependencies.ebookRepository.getAll.mockResolvedValue([
            makeEbook({ id: 1, title: "Parte I", introHtmlPath: "/materiais/mini-livros/ebook/parte-i/introducao_parte-i.html", order: 1 }),
        ]);
        dependencies.miniLivroSectionRepository.getAll.mockResolvedValue([
            makeMiniLivroSection({ id: 11, kind: "introducao", title: "Antes de começar", htmlPath: "/materiais/mini-livros/sections/introducao/11.html", index: 1 }),
        ]);

        const result = await useCase.execute({ type: "book", slug: "introducao-livro" });

        expect(result.next?.title).toBe("Antes de começar");
        expect(result.next?.href).toBe("/view/mini-livro-section/11");
    });

    it("leva da introdução para a primeira parte", async () => {
        dependencies.ebookRepository.getAll.mockResolvedValue([
            makeEbook({ id: 1, title: "Parte I", introHtmlPath: "/materiais/mini-livros/ebook/parte-i/introducao_parte-i.html", order: 1 }),
        ]);
        dependencies.miniLivroSectionRepository.getAll.mockResolvedValue([
            makeMiniLivroSection({ id: 11, kind: "introducao", title: "Antes de começar", htmlPath: "/materiais/mini-livros/sections/introducao/11.html", index: 1 }),
        ]);

        const result = await useCase.execute({ type: "mini-livro-section", slug: "11" });

        expect(result.previous).toBeNull();
        expect(result.next?.title).toBe("Parte I");
        expect(result.next?.href).toBe("/view/ebook/parte-i");
    });

    it("continua mini-livro para a introdução da próxima parte quando a parte atual termina", async () => {
        dependencies.ebookRepository.getAll.mockResolvedValue([
            makeEbook({ id: 1, title: "Parte I", introHtmlPath: "/materiais/mini-livros/ebook/parte-i/introducao_parte-i.html", order: 1 }),
            makeEbook({ id: 2, title: "Parte II", introHtmlPath: "/materiais/mini-livros/ebook/parte-ii/introducao_parte-ii.html", order: 2 }),
        ]);
        dependencies.miniLivroRepository.getAll.mockResolvedValue([
            makeMiniLivro({ id: 1, title: "Parte 1 - A", htmlPath: "/materiais/mini-livros/parte-1-a.html", index: 1, partOrder: 1 }),
            makeMiniLivro({ id: 2, title: "Parte 2 - A", htmlPath: "/materiais/mini-livros/parte-2-a.html", index: 1, partOrder: 2 }),
            makeMiniLivro({ id: 3, title: "Parte 1 - B", htmlPath: "/materiais/mini-livros/parte-1-b.html", index: 2, partOrder: 1 }),
        ]);

        const result = await useCase.execute({ type: "mini-livro", slug: "parte-1-b" });

        expect(result.previous?.title).toBe("Parte 1 - A");
        expect(result.next?.title).toBe("Parte II");
        expect(result.next?.href).toBe("/view/ebook/parte-ii");
    });

    it("leva do último capítulo da Parte III para o primeiro encerramento e percorre a ordem definida", async () => {
        dependencies.ebookRepository.getAll.mockResolvedValue([
            makeEbook({ id: 1, title: "Parte I", introHtmlPath: "/materiais/mini-livros/ebook/parte-i/introducao_parte-i.html", order: 1 }),
            makeEbook({ id: 2, title: "Parte II", introHtmlPath: "/materiais/mini-livros/ebook/parte-ii/introducao_parte-ii.html", order: 2 }),
            makeEbook({ id: 3, title: "Parte III", introHtmlPath: "/materiais/mini-livros/ebook/parte-iii/introducao_parte-iii.html", order: 3 }),
        ]);
        dependencies.miniLivroRepository.getAll.mockResolvedValue([
            makeMiniLivro({ id: 1, title: "Parte 3 - A", htmlPath: "/materiais/mini-livros/parte-3-a.html", index: 1, partOrder: 3 }),
            makeMiniLivro({ id: 2, title: "Parte 3 - B", htmlPath: "/materiais/mini-livros/parte-3-b.html", index: 2, partOrder: 3 }),
        ]);
        dependencies.miniLivroSectionRepository.getAll.mockResolvedValue([
            makeMiniLivroSection({ id: 21, kind: "encerramento", title: "Fecho 1", htmlPath: "/materiais/mini-livros/sections/encerramento/21.html", index: 1 }),
            makeMiniLivroSection({ id: 22, kind: "encerramento", title: "Fecho 2", htmlPath: "/materiais/mini-livros/sections/encerramento/22.html", index: 2 }),
        ]);

        const fromLastChapter = await useCase.execute({ type: "mini-livro", slug: "parte-3-b" });
        const fromFirstClosing = await useCase.execute({ type: "mini-livro-section", slug: "21" });

        expect(fromLastChapter.next?.title).toBe("Fecho 1");
        expect(fromLastChapter.next?.href).toBe("/view/mini-livro-section/21");
        expect(fromFirstClosing.previous?.title).toBe("Parte 3 - B");
        expect(fromFirstClosing.next?.title).toBe("Fecho 2");
        expect(fromFirstClosing.next?.href).toBe("/view/mini-livro-section/22");
    });

    it("ordena mini-livros por partOrder antes do index", async () => {
        dependencies.miniLivroRepository.getAll.mockResolvedValue([
            makeMiniLivro({ id: 4, title: "Parte 2 - B", htmlPath: "/materiais/mini-livros/parte-2-b.html", index: 2, partOrder: 2 }),
            makeMiniLivro({ id: 2, title: "Parte 2 - A", htmlPath: "/materiais/mini-livros/parte-2-a.html", index: 1, partOrder: 2 }),
            makeMiniLivro({ id: 1, title: "Parte 1 - A", htmlPath: "/materiais/mini-livros/parte-1-a.html", index: 1, partOrder: 1 }),
            makeMiniLivro({ id: 3, title: "Parte 1 - B", htmlPath: "/materiais/mini-livros/parte-1-b.html", index: 2, partOrder: 1 }),
        ]);

        const result = await useCase.execute({ type: "mini-livro", slug: "parte-2-a" });

        expect(result.previous?.title).toBe("Parte 1 - B");
        expect(result.next?.title).toBe("Parte 2 - B");
    });

    it("mantém a continuidade entre capítulos quando a próxima parte não tem introdução", async () => {
        dependencies.ebookRepository.getAll.mockResolvedValue([
            makeEbook({ id: 1, title: "Parte I", introHtmlPath: "/materiais/mini-livros/ebook/parte-i/introducao_parte-i.html", order: 1 }),
        ]);
        dependencies.miniLivroRepository.getAll.mockResolvedValue([
            makeMiniLivro({ id: 1, title: "Parte 1 - A", htmlPath: "/materiais/mini-livros/parte-1-a.html", index: 1, partOrder: 1 }),
            makeMiniLivro({ id: 2, title: "Parte 1 - B", htmlPath: "/materiais/mini-livros/parte-1-b.html", index: 2, partOrder: 1 }),
            makeMiniLivro({ id: 3, title: "Parte 2 - A", htmlPath: "/materiais/mini-livros/parte-2-a.html", index: 1, partOrder: 2 }),
        ]);

        const result = await useCase.execute({ type: "mini-livro", slug: "parte-1-b" });

        expect(result.next?.title).toBe("Parte 2 - A");
    });

    it("ordena ebooks por order", async () => {
        dependencies.ebookRepository.getAll.mockResolvedValue([
            makeEbook({ id: 3, title: "Parte III", introHtmlPath: "/materiais/mini-livros/ebook/parte-iii/introducao_parte-iii.html", order: 3 }),
            makeEbook({ id: 1, title: "Parte I", introHtmlPath: "/materiais/mini-livros/ebook/parte-i/introducao_parte-i.html", order: 1 }),
            makeEbook({ id: 2, title: "Parte II", introHtmlPath: "/materiais/mini-livros/ebook/parte-ii/introducao_parte-ii.html", order: 2 }),
        ]);

        const result = await useCase.execute({ type: "ebook", slug: "parte-ii" });

        expect(result.previous?.title).toBe("Parte I");
        expect(result.next?.title).toBe("Parte III");
    });

    it("ignora itens sem html navegável", async () => {
        dependencies.newsletterRepository.getAll.mockResolvedValue([
            makeNewsletter({ id: 1, title: "Primeira", htmlPath: "/materiais/newsletters/primeira.html", index: 1 }),
            makeNewsletter({ id: 2, title: "Sem HTML", htmlPath: null, index: 2 }),
            makeNewsletter({ id: 3, title: "Terceira", htmlPath: "/materiais/newsletters/terceira.html", index: 3 }),
        ]);

        const result = await useCase.execute({ type: "newsletter", slug: "primeira" });

        expect(result.previous).toBeNull();
        expect(result.next?.title).toBe("Terceira");
    });

    it("retorna vazio quando slug não corresponde a nenhum item", async () => {
        dependencies.newsletterRepository.getAll.mockResolvedValue([
            makeNewsletter({ id: 1, title: "Primeira", htmlPath: "/materiais/newsletters/primeira.html", index: 1 }),
        ]);

        const result = await useCase.execute({ type: "newsletter", slug: "inexistente" });

        expect(result.current).toBeNull();
        expect(result.previous).toBeNull();
        expect(result.next).toBeNull();
    });
});
