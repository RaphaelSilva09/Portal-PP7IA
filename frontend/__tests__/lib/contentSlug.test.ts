import { describe, expect, it } from "vitest";
import { extractSlugFromStoragePath } from "@/lib/contentSlug";

describe("extractSlugFromStoragePath", () => {
    it("extrai o slug de um caminho com pasta", () => {
        expect(extractSlugFromStoragePath("newsletters/pp-news-42.html")).toBe("pp-news-42");
    });

    it("extrai o slug de um caminho absoluto", () => {
        expect(extractSlugFromStoragePath("/materiais/newsletters/pp-news-42.html")).toBe("pp-news-42");
    });

    it("extrai o slug de um nome de arquivo sem pasta", () => {
        expect(extractSlugFromStoragePath("pp-news-42.html")).toBe("pp-news-42");
    });

    it("devolve null para caminho vazio, null ou undefined", () => {
        expect(extractSlugFromStoragePath("")).toBeNull();
        expect(extractSlugFromStoragePath(null)).toBeNull();
        expect(extractSlugFromStoragePath(undefined)).toBeNull();
    });

    it("devolve null para um caminho que não termina em .html", () => {
        expect(extractSlugFromStoragePath("newsletters/pp-news-42.pdf")).toBeNull();
    });

    it("não confunde o formato público (/view/tipo/slug, sem extensão) com o formato de storage", () => {
        // Contraste deliberado: é exatamente o bug que esta função existe para evitar
        // se alguém aplicasse a extração errada (formato público) no lado do admin.
        expect(extractSlugFromStoragePath("/view/newsletter/pp-news-42")).toBeNull();
    });
});
