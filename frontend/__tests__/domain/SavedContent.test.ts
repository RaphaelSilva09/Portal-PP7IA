import { describe, expect, it } from "vitest";
import { isSavableContentType, SAVABLE_CONTENT_TYPES } from "@/domain/entities/SavedContent";

describe("isSavableContentType", () => {
    it("accepts every content type that has a /view page", () => {
        for (const type of SAVABLE_CONTENT_TYPES) {
            expect(isSavableContentType(type)).toBe(true);
        }
    });

    it("rejects types without a saved-content table lookup (book, mini-livro-section, editorial)", () => {
        expect(isSavableContentType("book")).toBe(false);
        expect(isSavableContentType("mini-livro-section")).toBe(false);
        expect(isSavableContentType("editorial")).toBe(false);
        expect(isSavableContentType("anything-else")).toBe(false);
    });
});
