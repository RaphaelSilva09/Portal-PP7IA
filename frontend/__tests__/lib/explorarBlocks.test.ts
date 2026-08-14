import { describe, expect, it } from "vitest";

import {
    CONTENT_TYPE_TO_BLOCK_ID,
    PUBLIC_BLOCK_LABELS,
    blockIdForContentType,
    normalizeExplorarBlock,
    publicExplorarBlockSlug,
} from "@/lib/explorarBlocks";
import { SAVABLE_CONTENT_TYPES } from "@/domain/entities/SavedContent";

describe("explorar block aliases", () => {
    it("maps new public slugs to the existing internal blocks", () => {
        expect(normalizeExplorarBlock("inteligencia-artificial")).toBe("reportagem");
        expect(normalizeExplorarBlock("editoriais-artigos")).toBe("radar");
    });

    it("keeps legacy slugs working", () => {
        expect(normalizeExplorarBlock("reportagem")).toBe("reportagem");
        expect(normalizeExplorarBlock("radar")).toBe("radar");
    });

    it("emits the new public slugs for block links", () => {
        expect(publicExplorarBlockSlug("reportagem")).toBe("inteligencia-artificial");
        expect(publicExplorarBlockSlug("radar")).toBe("editoriais-artigos");
    });

    it("exposes the new public labels", () => {
        expect(PUBLIC_BLOCK_LABELS.reportagem).toBe("Inteligência Artificial");
        expect(PUBLIC_BLOCK_LABELS.radar).toBe("Editoriais e Artigos");
    });
});

describe("blockIdForContentType", () => {
    it("maps every savable content type to a block id", () => {
        for (const type of SAVABLE_CONTENT_TYPES) {
            expect(CONTENT_TYPE_TO_BLOCK_ID[type]).toBeTruthy();
        }
    });

    it("maps especial-semana and radar_oportunidades to their editorial block names", () => {
        expect(blockIdForContentType("especial-semana")).toBe("reportagem");
        expect(blockIdForContentType("radar_oportunidades")).toBe("radar");
    });

    it("maps mini-livro and ebook to the same 'livro' block", () => {
        expect(blockIdForContentType("mini-livro")).toBe("livro");
        expect(blockIdForContentType("ebook")).toBe("livro");
    });
});
