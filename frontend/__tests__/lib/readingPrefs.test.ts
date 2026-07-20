import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
    applyFontScaleToDocument,
    buildReadingPrefsCss,
    DEFAULT_READING_PREFS,
    loadReadingPrefs,
    READING_PREFS_STORAGE_KEY,
    sanitizeReadingPrefs,
    saveReadingPrefs,
} from "@/lib/readingPrefs";

describe("sanitizeReadingPrefs", () => {
    it("returns defaults for garbage input", () => {
        expect(sanitizeReadingPrefs(null)).toEqual(DEFAULT_READING_PREFS);
        expect(sanitizeReadingPrefs("x")).toEqual(DEFAULT_READING_PREFS);
        expect(sanitizeReadingPrefs({ fontScale: 99, weight: "black", lineHeight: 42 })).toEqual(
            DEFAULT_READING_PREFS,
        );
    });

    it("keeps valid values", () => {
        expect(sanitizeReadingPrefs({ fontScale: 1.15, weight: "medium", lineHeight: 1.7 })).toEqual({
            fontScale: 1.15,
            weight: "medium",
            lineHeight: 1.7,
        });
    });
});

describe("buildReadingPrefsCss", () => {
    it("returns empty string for defaults (document keeps original design)", () => {
        expect(buildReadingPrefsCss(DEFAULT_READING_PREFS)).toBe("");
    });

    it("scales font size via html percentage", () => {
        const css = buildReadingPrefsCss({ ...DEFAULT_READING_PREFS, fontScale: 1.3 });
        expect(css).toContain("font-size: 130% !important");
    });

    it("sets line-height on body and text blocks", () => {
        const css = buildReadingPrefsCss({ ...DEFAULT_READING_PREFS, lineHeight: 1.9 });
        expect(css).toContain("line-height: 1.9 !important");
    });

    it("bumps body text weight without touching headings", () => {
        const css = buildReadingPrefsCss({ ...DEFAULT_READING_PREFS, weight: "medium" });
        expect(css).toContain("font-weight: 500 !important");
        expect(css).not.toContain("h1");
    });

    it("supports a bolder weight step beyond medium", () => {
        const css = buildReadingPrefsCss({ ...DEFAULT_READING_PREFS, weight: "bold" });
        expect(css).toContain("font-weight: 700 !important");
    });
});

describe("applyFontScaleToDocument", () => {
    // Conteúdo real fixa font-size em px (direto ou via custom property CSS),
    // que `html { font-size: % }` não escala. Aqui simulamos isso com inline
    // style, que jsdom resolve via getComputedStyle. Usamos o `document`
    // global (com defaultView real) em vez de createHTMLDocument(), que
    // produz um documento "desconectado" sem defaultView.
    beforeEach(() => {
        document.body.innerHTML = `
            <p id="a" style="font-size: 14px;">texto</p>
            <h1 id="b" style="font-size: 30px;">título</h1>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("scales elements whose font-size is fixed in px", () => {
        applyFontScaleToDocument(document, 1.3);

        const p = document.getElementById("a") as HTMLElement;
        const h1 = document.getElementById("b") as HTMLElement;
        expect(p.style.getPropertyValue("font-size")).toBe("18.2px");
        expect(h1.style.getPropertyValue("font-size")).toBe("39px");
        expect(p.style.getPropertyPriority("font-size")).toBe("important");
    });

    it("does not compound scale across repeated calls (natural size is cached)", () => {
        applyFontScaleToDocument(document, 1.15);
        applyFontScaleToDocument(document, 1.3);

        const p = document.getElementById("a") as HTMLElement;
        // 14 * 1.3, não 14 * 1.15 * 1.3
        expect(p.style.getPropertyValue("font-size")).toBe("18.2px");
    });

    it("removes the inline override when scale returns to 1 (natural)", () => {
        applyFontScaleToDocument(document, 1.3);
        applyFontScaleToDocument(document, 1);

        const p = document.getElementById("a") as HTMLElement;
        expect(p.style.getPropertyValue("font-size")).toBe("");
    });
});

describe("load/save round-trip", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("loads defaults when nothing stored", () => {
        expect(loadReadingPrefs()).toEqual(DEFAULT_READING_PREFS);
    });

    it("persists and restores preferences", () => {
        saveReadingPrefs({ fontScale: 1.15, weight: "medium", lineHeight: 1.7 });
        expect(loadReadingPrefs()).toEqual({ fontScale: 1.15, weight: "medium", lineHeight: 1.7 });
    });

    it("recovers from corrupted storage", () => {
        window.localStorage.setItem(READING_PREFS_STORAGE_KEY, "{not json");
        expect(loadReadingPrefs()).toEqual(DEFAULT_READING_PREFS);
    });
});
