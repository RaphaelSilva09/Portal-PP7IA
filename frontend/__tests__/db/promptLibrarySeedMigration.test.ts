import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
    join(process.cwd(), "db/migrations/0023_seed_prompt_library_modern_prompts.sql"),
    "utf8",
);

const aiTools = ["Claude", "ChatGPT", "Gemini", "Adapta", "Perplexity", "Grok", "Manus"] as const;

describe("prompt library seed migration", () => {
    it("covers every portal AI with three curated prompts", () => {
        for (const tool of aiTools) {
            const matches = migration.match(new RegExp(`'${tool}'`, "g")) ?? [];
            expect(matches).toHaveLength(3);
        }
    });

    it("keeps the editorial balance for beginner and advanced users", () => {
        expect(migration.match(/'Iniciante'/g) ?? []).toHaveLength(14);
        expect((migration.match(/'Avancado'/g) ?? []).length).toBeGreaterThanOrEqual(7);
        expect(migration.match(/false,/g) ?? []).toHaveLength(7);
        expect(migration.match(/true,/g) ?? []).toHaveLength(14);
    });

    it("is idempotent without destructive data operations", () => {
        expect(migration).toContain("WITH seed");
        expect(migration).toContain("UPDATE public.prompt_library");
        expect(migration).toContain("WHERE NOT EXISTS");
        expect(migration).not.toMatch(/\bDELETE\b|\bTRUNCATE\b|\bDROP\b/i);
    });
});
