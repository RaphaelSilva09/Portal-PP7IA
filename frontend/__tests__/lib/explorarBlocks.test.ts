import { describe, expect, it } from "vitest";

import {
    PUBLIC_BLOCK_LABELS,
    normalizeExplorarBlock,
    publicExplorarBlockSlug,
} from "@/lib/explorarBlocks";

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
