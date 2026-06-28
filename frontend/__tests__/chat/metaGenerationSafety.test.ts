import { describe, expect, it } from "vitest";
import { assertCompleteMetaGeneration } from "@/lib/chat/metaGenerationSafety";

describe("assertCompleteMetaGeneration", () => {
    it("blocks persistence after any generation failure", () => {
        expect(() => assertCompleteMetaGeneration({
            failed: true,
            entityIndexReady: true,
        })).toThrow("No meta chunks were stored");
    });

    it("blocks persistence when the entity index was not generated", () => {
        expect(() => assertCompleteMetaGeneration({
            failed: false,
            entityIndexReady: false,
        })).toThrow("entity index");
    });

    it("allows persistence only when all generated artifacts are complete", () => {
        expect(() => assertCompleteMetaGeneration({
            failed: false,
            entityIndexReady: true,
        })).not.toThrow();
    });
});
