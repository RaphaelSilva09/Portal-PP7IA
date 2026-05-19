import { describe, it, expect } from "vitest";
import { deriveSlug, toSourceId } from "@/infrastructure/chat/contentSourceUtils";

describe("deriveSlug", () => {
    it("extracts slug from file path", () => {
        expect(deriveSlug("newsletters/nl-042.html")).toBe("nl-042");
    });
    it("handles .htm extension", () => {
        expect(deriveSlug("docs/item.htm")).toBe("item");
    });
    it("returns filename without path when no directory", () => {
        expect(deriveSlug("simple.html")).toBe("simple");
    });
});

describe("toSourceId", () => {
    it("produces deterministic UUID for valid id", () => {
        expect(toSourceId(1)).toBe("00000000-0000-4000-8000-000000000001");
        expect(toSourceId(255)).toBe("00000000-0000-4000-8000-0000000000ff");
    });
    it("accepts string numeric id", () => {
        expect(toSourceId("42")).toBe("00000000-0000-4000-8000-00000000002a");
    });
    it("throws on NaN input", () => {
        expect(() => toSourceId("abc")).toThrow("invalid numeric id");
    });
    it("throws on negative id", () => {
        expect(() => toSourceId(-1)).toThrow("invalid numeric id");
    });
    it("throws on non-integer id", () => {
        expect(() => toSourceId(1.5)).toThrow("invalid numeric id");
    });
    it("throws on id exceeding 48-bit field", () => {
        expect(() => toSourceId(0x1000000000000)).toThrow("exceeds 48-bit");
    });
    it("accepts max valid 48-bit id", () => {
        expect(toSourceId(0xffffffffffff)).toBe("00000000-0000-4000-8000-ffffffffffff");
    });
});
