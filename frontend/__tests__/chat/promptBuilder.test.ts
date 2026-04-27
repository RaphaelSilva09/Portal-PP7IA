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

describe("buildContext", () => {
    it("formats chunks with heading and divider", () => {
        const ctx = buildContext([chunk, { ...chunk, content: "Outro trecho." }]);
        expect(ctx).toContain("[Trecho 1 — Cap 2 — Tipos]");
        expect(ctx).toContain("[Trecho 2 — Cap 2 — Tipos]");
        expect(ctx).toContain("---");
    });

    it("falls back when heading_path empty", () => {
        const noHeading = { ...chunk, metadata: { ...chunk.metadata, heading_path: [] } };
        expect(buildContext([noHeading])).toContain("Sem título");
    });
});

describe("buildPrompt", () => {
    it("returns system, context, history (truncated), and question", () => {
        const messages = Array.from({ length: 8 }, (_, i) => ({
            role: i % 2 === 1 ? ("user" as const) : ("assistant" as const),
            content: `m${i}`,
        }));
        const prompt = buildPrompt({ messages, chunks: [chunk] });
        expect(prompt.system).toBe(SYSTEM_PROMPT);
        expect(prompt.context).toContain("Trecho 1");
        expect(prompt.history).toHaveLength(5);
        expect(prompt.question).toBe("m7");
    });

    it("throws when last message is not from user", () => {
        expect(() => buildPrompt({
            messages: [{ role: "assistant", content: "x" }],
            chunks: [],
        })).toThrow();
    });
});
