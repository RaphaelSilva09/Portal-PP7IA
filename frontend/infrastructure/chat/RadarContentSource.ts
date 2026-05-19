import { promises as fs } from "node:fs";
import { pool } from "@/lib/db";
import type { ContentSource, SourceItem } from "@/domain/chat/ContentSource";
import { deriveSlug, safeJoin, toSourceId } from "./contentSourceUtils";

interface Row {
    id: number | string;
    title: string | null;
    html_path: string | null;
}

export class RadarContentSource implements ContentSource {
    readonly sourceType = "radar_oportunidades";

    async fetchAll(): Promise<SourceItem[]> {
        const { rows } = await pool.query<Row>(
            `SELECT id, title, html_path FROM public.radar_oportunidades WHERE html_path IS NOT NULL`,
        );
        const items: SourceItem[] = [];
        for (const row of rows) {
            if (!row.html_path) continue;
            const slug = deriveSlug(row.html_path);
            if (!slug) continue;
            let html: string;
            try {
                html = await fs.readFile(safeJoin(row.html_path), "utf8");
            } catch (err: unknown) {
                const code = (err as { code?: string }).code;
                console.warn(`RadarContentSource: read failed for ${row.html_path}: ${code ?? (err as Error).message}`);
                continue;
            }
            items.push({ source_id: toSourceId(row.id), title: row.title ?? "", slug, html });
        }
        return items;
    }
}
