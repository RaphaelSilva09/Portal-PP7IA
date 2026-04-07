import { describe, expect, it } from "vitest";

import { ContentItem } from "@/domain/entities/ContentItem";
import { MiniLivro } from "@/domain/entities/MiniLivro";

describe("Mini-livro part metadata", () => {
    it("MiniLivro expõe partOrder e ebookId", () => {
        const miniLivro = MiniLivro.create({
            id: 8,
            createdAt: new Date("2026-04-07"),
            title: "teste",
            htmlPath: "/materiais/mini-livros/mini/008.html",
            pdfPath: null,
            readTime: 5,
            ebookId: null,
            partOrder: 2,
            index: 0,
        });

        expect(miniLivro.partOrder).toBe(2);
        expect(miniLivro.ebookId).toBeNull();
    });

    it("ContentItem expõe partOrder, ebookId e order com fallbacks", () => {
        const miniLivroItem = ContentItem.create({
            id: 8,
            createdAt: new Date("2026-04-07"),
            title: "teste",
            htmlPath: null,
            pdfPath: null,
            readTime: 5,
            ebookId: null,
            partOrder: 2,
        });

        const ebookItem = ContentItem.create({
            id: 2,
            createdAt: new Date("2026-04-07"),
            title: "A Coragem de Executar",
            htmlPath: null,
            pdfPath: null,
            readTime: 5,
            order: 2,
        });

        expect(miniLivroItem.partOrder).toBe(2);
        expect(miniLivroItem.ebookId).toBeNull();
        expect(ebookItem.order).toBe(2);
    });
});
