import path from "node:path";

const STORAGE_ROOT = process.env.STORAGE_ROOT ?? "./data";

/** Extract the slug from an HTML file path: "newsletters/nl-042.html" → "nl-042" */
export function deriveSlug(htmlPath: string): string {
    const fileName = htmlPath.split("/").pop() ?? "";
    return fileName.replace(/\.html?$/i, "");
}

/** Resolve a storage-relative path safely, blocking path traversal. */
export function safeJoin(relPath: string): string {
    const root = path.resolve(STORAGE_ROOT);
    const target = path.resolve(root, relPath);
    if (target !== root && !target.startsWith(root + path.sep)) {
        throw new Error(`Path traversal blocked: ${relPath}`);
    }
    return target;
}

/**
 * Convert a numeric DB row ID to a deterministic UUID string.
 * Required because rag_chunks.source_id is typed uuid in the DB schema.
 * Format: 00000000-0000-4000-8000-<12-hex-padded-id>
 */
export function toSourceId(numericId: number | string): string {
    const n = Number(numericId);
    const hex = n.toString(16).padStart(12, "0");
    return `00000000-0000-4000-8000-${hex}`;
}
