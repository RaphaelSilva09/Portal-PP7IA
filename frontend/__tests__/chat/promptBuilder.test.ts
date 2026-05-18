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
    it("formats chunks using the supplied citation index", () => {
        const chunks: RetrievedChunk[] = [
            { ...chunk, content: "A." },
            { ...chunk, content: "B." },
            { ...chunk, content: "C." },
        ];
        // chunks 0 and 2 belong to citation 1, chunk 1 belongs to citation 2
        const ctx = buildContext(chunks, [1, 2, 1]);
        expect(ctx).toContain("[Fonte 1 — Cap 2 — Tipos]\nA.");
        expect(ctx).toContain("[Fonte 2 — Cap 2 — Tipos]\nB.");
        expect(ctx).toContain("[Fonte 1 — Cap 2 — Tipos]\nC.");
        expect(ctx).toContain("---");
    });

    it("falls back when heading_path empty", () => {
        const noHeading = { ...chunk, metadata: { ...chunk.metadata, heading_path: [] } };
        expect(buildContext([noHeading], [1])).toContain("Sem título");
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
        expect(SYSTEM_PROMPT).toContain("[1][2]");
        expect(SYSTEM_PROMPT).toContain("[Fonte N]");
    });
});
