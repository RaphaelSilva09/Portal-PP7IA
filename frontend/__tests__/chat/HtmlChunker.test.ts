import { describe, it, expect } from "vitest";
import { HtmlChunker } from "@/infrastructure/chat/HtmlChunker";

const chunker = new HtmlChunker({ maxTokens: 80, overlapTokens: 10, minChars: 10 });

describe("HtmlChunker", () => {
    it("splits at h2 boundaries and records heading_path", () => {
        const html = `
            <h1>Livro</h1>
            <h2>Capítulo 1 — Introdução</h2><p>Conteúdo introdutório breve.</p>
            <h2>Capítulo 2 — Tipos</h2><p>Outro conteúdo aqui.</p>
        `;
        const chunks = chunker.chunk(html);

        expect(chunks).toHaveLength(2);
        expect(chunks[0].metadata.heading_path).toEqual(["Livro", "Capítulo 1 — Introdução"]);
        expect(chunks[0].content).toContain("Conteúdo introdutório");
        expect(chunks[1].metadata.heading_path).toEqual(["Livro", "Capítulo 2 — Tipos"]);
    });

    it("splits oversize chunks with token overlap", () => {
        const longText = "palavra ".repeat(500);  // ~500 tokens
        const html = `<h2>Long</h2><p>${longText}</p>`;
        const chunks = chunker.chunk(html);

        expect(chunks.length).toBeGreaterThan(1);
        // Each subchunk under maxTokens
        for (const c of chunks) {
            expect(c.content.split(/\s+/).filter(Boolean).length).toBeLessThanOrEqual(80);
        }
        // Overlap: end of chunk N appears at start of chunk N+1
        const lastWords0 = chunks[0].content.trim().split(/\s+/).slice(-5).join(" ");
        expect(chunks[1].content).toContain(lastWords0.split(" ").slice(-3).join(" "));
    });

    it("merges undersized adjacent chunks", () => {
        const html = `
            <h2>A</h2><p>x x</p>
            <h2>B</h2><p>y y</p>
        `;
        const chunks = chunker.chunk(html);
        // Both sections are tiny — should merge
        expect(chunks).toHaveLength(1);
        expect(chunks[0].content).toContain("x x");
        expect(chunks[0].content).toContain("y y");
    });

    it("attaches heading_path with h1/h2/h3 stack", () => {
        const html = `
            <h1>Top</h1>
            <h2>Mid</h2>
            <h3>Sub</h3>
            <p>Conteúdo aqui é suficiente para virar chunk próprio.</p>
        `;
        const chunks = chunker.chunk(html, { minChars: 1 });
        expect(chunks[0].metadata.heading_path).toEqual(["Top", "Mid", "Sub"]);
    });

    it("returns empty array for empty html", () => {
        expect(chunker.chunk("")).toEqual([]);
        expect(chunker.chunk("   ")).toEqual([]);
    });
});
