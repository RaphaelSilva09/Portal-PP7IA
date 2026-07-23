/**
 * File serving route — replaces storage de arquivos public URLs.
 *
 * Reads files from STORAGE_ROOT (Railway Volume) and streams them.
 * Path-traversal guard via prefix check after resolution.
 * ETag based on mtime + size for cheap cache validation.
 */
import { NextRequest } from "next/server";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const STORAGE_ROOT = process.env.STORAGE_ROOT ?? "./data";

const MIME: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".txt": "text/plain; charset=utf-8",
    ".css": "text/css; charset=utf-8",
};

function lookupMime(p: string): string {
    return MIME[path.extname(p).toLowerCase()] ?? "application/octet-stream";
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path: segments } = await params;
    if (!segments?.length) {
        return new Response("Not found", { status: 404 });
    }

    const root = path.resolve(STORAGE_ROOT);
    const target = path.resolve(root, ...segments);

    if (target !== root && !target.startsWith(root + path.sep)) {
        return new Response("Not found", { status: 404 });
    }

    let stat;
    try {
        stat = await fs.stat(target);
        if (!stat.isFile()) {
            return new Response("Not found", { status: 404 });
        }
    } catch {
        return new Response("Not found", { status: 404 });
    }

    const etag = `"${stat.mtimeMs.toString(36)}-${stat.size.toString(36)}"`;
    if (req.headers.get("if-none-match") === etag) {
        return new Response(null, { status: 304, headers: { ETag: etag } });
    }

    const stream = createReadStream(target);
    return new Response(stream as unknown as ReadableStream, {
        headers: {
            "Content-Type": lookupMime(target),
            "Content-Length": String(stat.size),
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
            ETag: etag,
        },
    });
}
