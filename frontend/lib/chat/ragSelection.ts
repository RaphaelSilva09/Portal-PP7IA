import type { RetrievedChunk } from "@/domain/chat/Chunk";
import { isCitable } from "@/lib/chat/ragSources";

interface SelectRagContextOptions {
    chunks: RetrievedChunk[];
    minSimilarity: number;
    metaFallbackMinSimilarity: number;
    metaFallbackLimit?: number;
}

interface SelectedRagContext {
    citableCandidates: RetrievedChunk[];
    uncitedChunks: RetrievedChunk[];
    usedMetaFallback: boolean;
}

export function selectRagContext({
    chunks,
    minSimilarity,
    metaFallbackMinSimilarity,
    metaFallbackLimit = 4,
}: SelectRagContextOptions): SelectedRagContext {
    const uncitedChunks = chunks.filter(c => !isCitable(c.source_type));
    const citableChunks = chunks.filter(c => isCitable(c.source_type));
    const citableCandidates = citableChunks.filter(c => c.similarity >= minSimilarity);

    if (citableCandidates.length > 0) {
        return { citableCandidates, uncitedChunks, usedMetaFallback: false };
    }

    const hasRelevantMetaContext = uncitedChunks.some(c => c.similarity >= minSimilarity);
    if (!hasRelevantMetaContext) {
        return { citableCandidates: [], uncitedChunks, usedMetaFallback: false };
    }

    const fallbackCandidates = citableChunks
        .filter(c => c.similarity >= metaFallbackMinSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, metaFallbackLimit);

    return {
        citableCandidates: fallbackCandidates,
        uncitedChunks,
        usedMetaFallback: fallbackCandidates.length > 0,
    };
}
