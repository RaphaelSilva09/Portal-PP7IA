// frontend/domain/chat/RagAnswer.ts
import type { ChunkMetadata } from "./Chunk";

export interface Citation {
    source_type: string;       // used by hrefForCitation for URL routing
    slug: string;
    title: string;
    heading_path: string[];
    similarity: number;
}

export type SseEvent =
    | { type: "token"; content: string }
    | { type: "done"; citations: Citation[] }
    | { type: "error"; code: ErrorCode; message: string };

export type ErrorCode =
    | "auth_required"
    | "rate_limit"
    | "no_match"
    | "server_error";

export function citationFromMetadata(
    metadata: ChunkMetadata,
    similarity: number,
    sourceType: string,
): Citation {
    // meta_summary chunks cite the parent document, not the meta chunk itself
    if (sourceType === "meta_summary") {
        return {
            source_type: metadata.parent_source_type ?? sourceType,
            slug: metadata.parent_slug ?? metadata.slug,
            title: metadata.parent_title ?? metadata.title,
            heading_path: [],
            similarity,
        };
    }
    return {
        source_type: sourceType,
        slug: metadata.slug,
        title: metadata.title,
        heading_path: metadata.heading_path,
        similarity,
    };
}
