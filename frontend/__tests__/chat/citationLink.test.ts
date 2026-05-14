import { describe, it, expect } from "vitest";
import { hrefForCitation } from "@/lib/chat/citationLink";
import type { Citation } from "@/domain/chat/RagAnswer";

const base: Citation = { slug: "003", title: "ML 3", heading_path: [], similarity: 0.9 };

describe("hrefForCitation", () => {
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
