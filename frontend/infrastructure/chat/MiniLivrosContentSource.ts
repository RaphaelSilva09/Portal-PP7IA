// frontend/infrastructure/chat/MiniLivrosContentSource.ts
import type { ContentSource, SourceItem } from "@/domain/chat/ContentSource";
import { getServiceRoleClient } from "./serviceRoleClient";

interface ParsedPath {
    bucket: string;
    pathWithinBucket: string;
    slug: string;
}

function parseHtmlPath(htmlPath: string): ParsedPath | null {
    const trimmed = htmlPath.replace(/^\/+/, "");
    const slashIdx = trimmed.indexOf("/");
    if (slashIdx <= 0 || slashIdx === trimmed.length - 1) return null;
    const bucket = trimmed.slice(0, slashIdx);
    const pathWithinBucket = trimmed.slice(slashIdx + 1);
    const fileName = pathWithinBucket.split("/").pop() ?? "";
    if (!fileName) return null;
    const slug = fileName.replace(/\.html?$/i, "");
    if (!slug) return null;
    return { bucket, pathWithinBucket, slug };
}

export class MiniLivrosContentSource implements ContentSource {
    readonly sourceType = "mini_livro";

    constructor(private readonly supabase = getServiceRoleClient()) {}

    async fetchAll(): Promise<SourceItem[]> {
        const { data, error } = await this.supabase
            .from("mini_livros")
            .select("id, title, html_path")
            .not("html_path", "is", null);

        if (error) {
            throw new Error(`MiniLivrosContentSource: failed to fetch mini_livros: ${error.message}`);
        }

        const items: SourceItem[] = [];
        for (const row of data ?? []) {
            const htmlPath = (row as { html_path?: string | null }).html_path;
            if (!htmlPath) continue;

            const parsed = parseHtmlPath(htmlPath);
            if (!parsed) {
                console.warn(`MiniLivrosContentSource: cannot parse html_path: ${htmlPath}`);
                continue;
            }

            const { data: blob, error: dlError } = await this.supabase
                .storage
                .from(parsed.bucket)
                .download(parsed.pathWithinBucket);
            if (dlError || !blob) {
                console.warn(`MiniLivrosContentSource: download failed for ${htmlPath}: ${dlError?.message ?? "no body"}`);
                continue;
            }

            const html = await blob.text();
            items.push({
                source_id: String((row as { id: number | string }).id),
                title: ((row as { title?: string | null }).title) ?? "",
                slug: parsed.slug,
                html,
            });
        }

        return items;
    }
}
