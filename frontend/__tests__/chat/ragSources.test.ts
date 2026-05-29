import { describe, it, expect } from "vitest";
import { RAG_SOURCES, isCitable } from "@/lib/chat/ragSources";

describe("RAG_SOURCES", () => {
    it("has no duplicate sourceTypes", () => {
        const types = RAG_SOURCES.map(s => s.sourceType);
        expect(new Set(types).size).toBe(types.length);
    });

    it("mini_livro has topK 50", () => {
        const s = RAG_SOURCES.find(s => s.sourceType === "mini_livro")!;
        expect(s.topK).toBe(50);
    });

    it("meta_global is the only non-citable source", () => {
        const nonCitable = RAG_SOURCES.filter(s => !s.citable);
        expect(nonCitable).toHaveLength(1);
        expect(nonCitable[0].sourceType).toBe("meta_global");
    });
});

describe("isCitable", () => {
    it("returns true for citable sources", () => {
        expect(isCitable("mini_livro")).toBe(true);
        expect(isCitable("newsletter")).toBe(true);
        expect(isCitable("meta_summary")).toBe(true);
    });

    it("returns false for meta_global", () => {
        expect(isCitable("meta_global")).toBe(false);
    });

    it("defaults to true for unknown source types", () => {
        expect(isCitable("unknown_source")).toBe(true);
    });
});
