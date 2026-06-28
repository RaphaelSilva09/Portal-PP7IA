import { describe, expect, it, vi } from "vitest";
import { buildEntityIndexText, packTextBatches } from "@/lib/chat/entityIndex";

describe("packTextBatches", () => {
    it("keeps late entries instead of truncating the combined text", () => {
        const batches = packTextBatches([
            "Documento 1: Alfa",
            "Documento 2: Beta",
            "Documento 3: Pessoa Zeta",
        ], 32);

        expect(batches.join("\n")).toContain("Documento 1");
        expect(batches.join("\n")).toContain("Documento 3: Pessoa Zeta");
        expect(batches.length).toBeGreaterThan(1);
    });
});

describe("buildEntityIndexText", () => {
    it("sends every summary through batched indexing instead of slicing the corpus", async () => {
        const prompts: string[] = [];
        const generate = vi.fn(async ({ question }: { question: string }) => {
            prompts.push(question);
            return `índice parcial ${prompts.length}`;
        });

        const result = await buildEntityIndexText({
            summaries: [
                { title: "Documento 1", content: "A".repeat(90) },
                { title: "Documento 2", content: "B".repeat(90) },
                { title: "Documento 3", content: "Pessoa Zeta aparece no final." },
            ],
            generate,
            batchCharLimit: 120,
        });

        expect(generate).toHaveBeenCalled();
        expect(prompts.some(prompt => prompt.includes("Pessoa Zeta"))).toBe(true);
        expect(result).toContain("[Índice global de entidades]");
    });
});
