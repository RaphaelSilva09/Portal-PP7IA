import { promises as fs } from "node:fs";
import path from "node:path";
import { pool } from "@/lib/db";
import type { ContentSource, SourceItem } from "@/domain/chat/ContentSource";

const STORAGE_ROOT = process.env.STORAGE_ROOT ?? "./data";

interface MiniLivroRow {
    id: number | string;
    title: string | null;
    html_path: string | null;
}

function deriveSlug(htmlPath: string): string {
    const fileName = htmlPath.split("/").pop() ?? "";
    return fileName.replace(/\.html?$/i, "");
}

function safeJoin(relPath: string): string {
    const root = path.resolve(STORAGE_ROOT);
    const target = path.resolve(root, relPath);
    if (target !== root && !target.startsWith(root + path.sep)) {
        throw new Error(`Path traversal blocked: ${relPath}`);
    }
    return target;
}

export class MiniLivrosContentSource implements ContentSource {
    readonly sourceType = "mini_livro";

    async fetchAll(): Promise<SourceItem[]> {
        const { rows } = await pool.query<MiniLivroRow>(
            `SELECT id, title, html_path FROM public.mini_livros WHERE html_path IS NOT NULL`,
        );

        const items: SourceItem[] = [];
        for (const row of rows) {
            const htmlPath = row.html_path;
            if (!htmlPath) continue;

            const slug = deriveSlug(htmlPath);
            if (!slug) {
                console.warn(`MiniLivrosContentSource: cannot derive slug from html_path: ${htmlPath}`);
                continue;
            }

            let html: string;
            try {
                const absPath = safeJoin(htmlPath);
                html = await fs.readFile(absPath, "utf8");
            } catch (err: unknown) {
                const code = (err as { code?: string }).code;
                console.warn(
                    `MiniLivrosContentSource: read failed for ${htmlPath}: ${code ?? (err as Error).message}`,
                );
                continue;
            }

            items.push({
                source_id: String(row.id),
                title: row.title ?? "",
                slug,
                html,
            });
        }

        return items;
    }
}
