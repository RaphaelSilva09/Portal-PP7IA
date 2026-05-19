import { describe, it, expect } from "vitest";
import { buildContext, buildPrompt, SYSTEM_PROMPT } from "@/lib/chat/promptBuilder";
import type { RetrievedChunk } from "@/domain/chat/Chunk";

const chunk: RetrievedChunk = {
    source_type: "mini_livro",
    source_id: "1",
    chunk_index: 0,
    content: "IA estreita resolve uma tarefa.",
    metadata: { heading_path: ["Cap 2", "Tipos"], slug: "intro", title: "Intro", char_start: 0, char_end: 30 },
    similarity: 0.8,
};

const newsletterChunk: RetrievedChunk = {
    source_type: "newsletter",
    source_id: "2",
    chunk_index: 0,
    content: "Conteúdo da newsletter.",
    metadata: { heading_path: ["Seção A"], slug: "nl-042", title: "Newsletter 42", char_start: 0, char_end: 20 },
    similarity: 0.75,
};

describe("buildContext", () => {
    it("labels mini_livro chunks with source type prefix", () => {
        const ctx = buildContext([chunk], [1]);
        expect(ctx).toContain("[Fonte 1 — Mini-Livro: Cap 2 — Tipos]");
        expect(ctx).toContain("IA estreita resolve uma tarefa.");
    });

    it("labels newsletter chunks with source type prefix", () => {
        const ctx = buildContext([newsletterChunk], [1]);
        expect(ctx).toContain("[Fonte 1 — Newsletter: Seção A]");
    });

    it("formats multiple chunks with citation indices", () => {
        const chunks: RetrievedChunk[] = [
            { ...chunk, content: "A." },
            { ...chunk, content: "B." },
            { ...chunk, content: "C." },
        ];
        const ctx = buildContext(chunks, [1, 2, 1]);
        expect(ctx).toContain("[Fonte 1 — Mini-Livro: Cap 2 — Tipos]\nA.");
        expect(ctx).toContain("[Fonte 2 — Mini-Livro: Cap 2 — Tipos]\nB.");
        expect(ctx).toContain("[Fonte 1 — Mini-Livro: Cap 2 — Tipos]\nC.");
        expect(ctx).toContain("---");
    });

    it("falls back to title when heading_path is empty", () => {
        const noHeading = { ...chunk, metadata: { ...chunk.metadata, heading_path: [] } };
        const ctx = buildContext([noHeading], [1]);
        expect(ctx).toContain("Mini-Livro: Intro");
    });

    it("appends [Contexto adicional] block when uncitedChunks provided", () => {
        const uncited: RetrievedChunk = {
            ...chunk,
            source_type: "meta_global",
            content: "Pessoas mais citadas: Paulo Fernandes.",
        };
        const ctx = buildContext([chunk], [1], [uncited]);
        expect(ctx).toContain("[Contexto adicional]");
        expect(ctx).toContain("Pessoas mais citadas: Paulo Fernandes.");
    });

    it("throws when chunkToCitationIdx length mismatches chunks", () => {
        expect(() => buildContext([chunk], [1, 2])).toThrow("buildContext");
    });

    it("promotes meta_summary label to parent_source_type when available", () => {
        const metaChunk: RetrievedChunk = {
            ...chunk,
            source_type: "meta_summary",
            metadata: { ...chunk.metadata, heading_path: [], parent_source_type: "newsletter", parent_title: "Newsletter 10" },
        };
        const ctx = buildContext([metaChunk], [1]);
        expect(ctx).toContain("[Fonte 1 — Newsletter: Newsletter 10]");
        expect(ctx).not.toContain("Resumo");
    });

    it("labels meta_summary as Resumo when parent_source_type is absent", () => {
        const metaNoParent: RetrievedChunk = {
            ...chunk,
            source_type: "meta_summary",
            metadata: { ...chunk.metadata, heading_path: [] },
        };
        const ctx = buildContext([metaNoParent], [1]);
        expect(ctx).toContain("[Fonte 1 — Resumo: Intro]");
    });
});

describe("buildPrompt", () => {
    it("returns system, context, history (truncated), and question", () => {
        const messages = Array.from({ length: 8 }, (_, i) => ({
            role: i % 2 === 1 ? ("user" as const) : ("assistant" as const),
            content: `m${i}`,
        }));
        const prompt = buildPrompt({ messages, chunks: [chunk], chunkToCitationIdx: [1] });
        expect(prompt.system).toBe(SYSTEM_PROMPT);
        expect(prompt.context).toContain("Fonte 1");
        expect(prompt.history).toHaveLength(5);
        expect(prompt.question).toBe("m7");
    });

    it("passes uncitedChunks through to context", () => {
        const uncited: RetrievedChunk = {
            ...chunk,
            source_type: "meta_global",
            content: "Contexto global.",
        };
        const prompt = buildPrompt({
            messages: [{ role: "user", content: "pergunta" }],
            chunks: [chunk],
            chunkToCitationIdx: [1],
            uncitedChunks: [uncited],
        });
        expect(prompt.context).toContain("[Contexto adicional]");
        expect(prompt.context).toContain("Contexto global.");
    });

    it("throws when last message is not from user", () => {
        expect(() => buildPrompt({
            messages: [{ role: "assistant", content: "x" }],
            chunks: [],
            chunkToCitationIdx: [],
        })).toThrow();
    });
});

describe("SYSTEM_PROMPT", () => {
    it("includes the citation-marker rules", () => {
        expect(SYSTEM_PROMPT).toContain("REGRAS de citação");
        expect(SYSTEM_PROMPT).toContain("[N]");
    });

    it("includes the Contexto adicional rule", () => {
        expect(SYSTEM_PROMPT).toContain("[Contexto adicional]");
    });

    it("does not mention only mini-livros", () => {
        expect(SYSTEM_PROMPT).not.toContain("livro 'Enquanto é Tempo'");
    });
});
