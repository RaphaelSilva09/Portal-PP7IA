import { describe, it, expect } from "vitest";
import { hrefForCitation } from "@/lib/chat/citationLink";
import type { Citation } from "@/domain/chat/RagAnswer";

const base: Citation = {
    source_type: "mini_livro",
    slug: "003",
    title: "ML 3",
    heading_path: [],
    similarity: 0.9,
};

describe("hrefForCitation — mini_livro", () => {
    it("uses last heading as anchor", () => {
        const c: Citation = { ...base, heading_path: ["Enquanto é Tempo", "A Ilusão da Competência"] };
        expect(hrefForCitation(c)).toBe("/view/mini-livro/003#a-ilusao-da-competencia");
    });

    it("falls back to slug-only when no heading", () => {
        expect(hrefForCitation(base)).toBe("/view/mini-livro/003");
    });

    it("strips diacritics and punctuation in anchor", () => {
        const c: Citation = { ...base, heading_path: ["Capítulo I — Início! ção"] };
        expect(hrefForCitation(c)).toBe("/view/mini-livro/003#capitulo-i-inicio-cao");
    });
});

describe("hrefForCitation — other content types", () => {
    it("newsletter: document-level link, no anchor", () => {
        const c: Citation = { ...base, source_type: "newsletter", slug: "newsletter-042" };
        expect(hrefForCitation(c)).toBe("/view/newsletter/newsletter-042");
    });

    it("radar_oportunidades: document-level link", () => {
        const c: Citation = { ...base, source_type: "radar_oportunidades", slug: "radar-010" };
        expect(hrefForCitation(c)).toBe("/view/radar_oportunidades/radar-010");
    });

    it("especial_semana: uses hyphenated route", () => {
        const c: Citation = { ...base, source_type: "especial_semana", slug: "especial-005" };
        expect(hrefForCitation(c)).toBe("/view/especial-semana/especial-005");
    });

    it("biblioteca: document-level link", () => {
        const c: Citation = { ...base, source_type: "biblioteca", slug: "livro-x" };
        expect(hrefForCitation(c)).toBe("/view/biblioteca/livro-x");
    });

    it("estudar: document-level link", () => {
        const c: Citation = { ...base, source_type: "estudar", slug: "aula-01" };
        expect(hrefForCitation(c)).toBe("/view/estudar/aula-01");
    });

    it("ignores heading_path for non-mini-livro types", () => {
        const c: Citation = {
            ...base,
            source_type: "newsletter",
            slug: "nl-001",
            heading_path: ["Section A", "Sub B"],
        };
        expect(hrefForCitation(c)).toBe("/view/newsletter/nl-001");
    });
});
