import { promises as fs } from "node:fs";
import { pool } from "@/lib/db";
import type { ContentSource, SourceItem } from "@/domain/chat/ContentSource";
import { deriveSlug, safeJoin, toSourceId } from "./contentSourceUtils";

interface MiniLivroRow {
    id: number | string;
    title: string | null;
    html_path: string | null;
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
                source_id: toSourceId(row.id),
                title: row.title ?? "",
                slug,
                html,
            });
        }

        return items;
    }
}
