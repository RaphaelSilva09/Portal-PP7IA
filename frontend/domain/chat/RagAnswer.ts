// frontend/domain/chat/RagAnswer.ts
import type { ChunkMetadata } from "./Chunk";

export interface Citation {
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
): Citation {
    return {
        slug: metadata.slug,
        title: metadata.title,
        heading_path: metadata.heading_path,
        similarity,
    };
}
