import { describe, expect, it } from "vitest";

import { DEFAULT_HOMEPAGE_CONFIG, SECTION_LABELS } from "@/domain/entities/HomepageConfig";

describe("HomepageConfig editorial defaults", () => {
    const seteCores = DEFAULT_HOMEPAGE_CONFIG.sections.find(section => section.id === "sete-cores");

    it("names blocks 2 and 3 as the new editorial sections", () => {
        expect(seteCores?.texts.block2_label).toBe("Inteligência Artificial");
        expect(seteCores?.texts.block3_label).toBe("Editoriais e Artigos");
    });

    it("links blocks 2 and 3 through the new public explorar aliases", () => {
        expect(seteCores?.texts.block2_href).toBe("/explorar?b=inteligencia-artificial");
        expect(seteCores?.texts.block3_href).toBe("/explorar?b=editoriais-artigos");
    });

    it("uses the public section labels in the homepage admin", () => {
        expect(SECTION_LABELS.ias).toBe("Inteligência Artificial");
        expect(SECTION_LABELS.editorial).toBe("Editoriais e Artigos");
    });
});
