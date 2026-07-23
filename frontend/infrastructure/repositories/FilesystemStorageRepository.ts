/**
 * FilesystemStorageRepository
 *
 * Files live under STORAGE_ROOT
 * (Railway Volume mount, defaults to ./data locally for dev).
 * "Bucket" maps to a top-level folder under that root.
 * Public URLs are served by the /api/files/[...path] route handler.
 */

import { promises as fs } from "fs";
import path from "path";
import type {
    IStorageRepository,
    UploadResult,
} from "@/domain/repositories/IStorageRepository";

const STORAGE_ROOT = process.env.STORAGE_ROOT ?? "./data";
const PUBLIC_BASE = process.env.PUBLIC_FILES_BASE_URL ?? "/api/files";

function safeJoin(...parts: string[]): string {
    const root = path.resolve(STORAGE_ROOT);
    const target = path.resolve(root, ...parts);
    if (target !== root && !target.startsWith(root + path.sep)) {
        throw new Error("Caminho inválido (path traversal blocked)");
    }
    return target;
}

function sanitizeSegment(segment: string): string {
    return segment
        .replace(/^\/+/, "")
        .replace(/\/+$/, "")
        .replace(/[^\w./\-]/g, "_")
        .replace(/\.{2,}/g, "_");
}

export class FilesystemStorageRepository implements IStorageRepository {
    async upload(bucket: string, fileName: string, file: File): Promise<UploadResult> {
        const safeBucket = sanitizeSegment(bucket);
        const safeName = sanitizeSegment(fileName);
        if (!safeBucket || !safeName) {
            throw new Error("Bucket ou nome de arquivo inválido");
        }

        const relPath = path.posix.join(safeBucket, safeName);
        const absPath = safeJoin(safeBucket, safeName);

        await fs.mkdir(path.dirname(absPath), { recursive: true });
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(absPath, buffer);

        return {
            path: relPath,
            publicUrl: `${PUBLIC_BASE}/${relPath}`,
        };
    }

    async delete(bucket: string, filePath: string): Promise<void> {
        const safeBucket = sanitizeSegment(bucket);
        const safeRel = sanitizeSegment(filePath);
        const absPath = safeJoin(safeBucket, safeRel);

        try {
            await fs.unlink(absPath);
        } catch (err: unknown) {
            const code = (err as { code?: string }).code;
            if (code !== "ENOENT") {
                throw new Error(`Falha ao deletar arquivo: ${(err as Error).message}`);
            }
            // Already gone — non-fatal.
        }
    }
}
