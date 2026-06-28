import { describe, expect, it } from "vitest";
import { selectRagContext } from "@/lib/chat/ragSelection";
import type { RetrievedChunk } from "@/domain/chat/Chunk";

function chunk(source_type: string, similarity: number, slug = source_type): RetrievedChunk {
    return {
        source_type,
        source_id: slug,
        chunk_index: 0,
        content: `${source_type} content`,
        metadata: {
            heading_path: [],
            slug,
            title: slug,
            char_start: 0,
            char_end: 10,
        },
        similarity,
    };
}

describe("selectRagContext", () => {
    it("keeps regular citable matches when they clear the normal threshold", () => {
        const result = selectRagContext({
            chunks: [
                chunk("mini_livro", 0.72),
                chunk("newsletter", 0.44),
                chunk("meta_entity_index", 0.91),
            ],
            minSimilarity: 0.55,
            metaFallbackMinSimilarity: 0.45,
        });

        expect(result.usedMetaFallback).toBe(false);
        expect(result.citableCandidates.map(c => c.source_type)).toEqual(["mini_livro"]);
    });

    it("uses relevant non-citable meta context to keep grounded citable fallback chunks", () => {
        const result = selectRagContext({
            chunks: [
                chunk("mini_livro", 0.49),
                chunk("newsletter", 0.43),
                chunk("meta_entity_index", 0.88),
            ],
            minSimilarity: 0.55,
            metaFallbackMinSimilarity: 0.45,
        });

        expect(result.usedMetaFallback).toBe(true);
        expect(result.citableCandidates.map(c => c.source_type)).toEqual(["mini_livro"]);
        expect(result.uncitedChunks.map(c => c.source_type)).toEqual(["meta_entity_index"]);
    });

    it("does not fall back when meta context is below the normal threshold", () => {
        const result = selectRagContext({
            chunks: [
                chunk("mini_livro", 0.49),
                chunk("meta_themes", 0.52),
            ],
            minSimilarity: 0.55,
            metaFallbackMinSimilarity: 0.45,
        });

        expect(result.usedMetaFallback).toBe(false);
        expect(result.citableCandidates).toEqual([]);
    });
});
