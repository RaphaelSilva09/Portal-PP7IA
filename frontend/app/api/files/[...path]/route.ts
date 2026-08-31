/**
 * File serving route — replaces storage de arquivos public URLs.
 *
 * Reads files from STORAGE_ROOT (Railway Volume) and streams them.
 * Path-traversal guard via prefix check after resolution.
 * ETag based on mtime + size for cheap cache validation.
 *
 * Esta rota serve o MESMO arquivo físico que /api/proxy-html/[type]/[slug]
 * protege (mesma convenção "materiais/{folder}/{slug}.{html,pdf}" de
 * STORAGE_CONFIG, ver lib/contentStorage.ts) — sem a checagem abaixo, o
 * bloqueio de acesso a conteúdo (EvaluateContentAccessUseCase) seria
 * contornável só trocando /view/{type}/{slug} por
 * /api/files/materiais/{folder}/{slug}.html direto, já que slug e prefixo de
 * pasta já são públicos hoje (aparecem no HTML/JSON da página normalmente).
 */
import { NextRequest } from "next/server";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { getUser } from "@/infrastructure/auth/getUser";
import DIContainer from "@/infrastructure/di/container";
import { STORAGE_CONFIG } from "@/lib/contentStorage";

export const runtime = "nodejs";

const STORAGE_ROOT = process.env.STORAGE_ROOT ?? "./data";

/** Tipos com bloqueio de acesso configurável pelo admin — mesmos 6 de app/api/content/[type]/route.ts. */
const LOCKABLE_TYPES = new Set(["newsletter", "mini-livro", "biblioteca", "especial-semana", "radar_oportunidades", "estudar"]);

const FOLDER_TO_LOCKABLE_TYPE = new Map(
    Object.entries(STORAGE_CONFIG)
        .filter(([type]) => LOCKABLE_TYPES.has(type))
        .map(([type, config]) => [config.folder, type]),
);

/**
 * Se o caminho pedido é o HTML/PDF de um conteúdo bloqueável, devolve
 * type+slug para checar acesso. Não cobre a convenção especial de "ebook"
 * (introducao_{slug}.html) porque esse tipo está fora do escopo de
 * bloqueio; qualquer caminho que não bata com "materiais/{folder}/{slug}.
 * {html,pdf}" para um dos 6 tipos em escopo passa direto (comportamento
 * inalterado para imagens, outros tipos de arquivo, etc.).
 */
function lockableContentFor(segments: string[]): { type: string; slug: string } | null {
    if (segments[0] !== "materiais" || segments.length < 3) return null;
    const rest = segments.slice(1);
    const filename = rest[rest.length - 1];
    const folder = rest.slice(0, -1).join("/");
    const match = filename.match(/^([a-zA-Z0-9_-]+)\.(html|pdf)$/);
    if (!match) return null;
    const type = FOLDER_TO_LOCKABLE_TYPE.get(folder);
    return type ? { type, slug: match[1] } : null;
}

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

    const lockable = lockableContentFor(segments);
    if (lockable) {
        const user = await getUser();
        const access = await DIContainer.getEvaluateContentAccessUseCase().execute({
            contentType: lockable.type,
            slug: lockable.slug,
            userId: user?.id ?? null,
            role: user?.role ?? null,
        });
        if (!access.allowed) {
            return new Response("Forbidden", { status: 403 });
        }
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
