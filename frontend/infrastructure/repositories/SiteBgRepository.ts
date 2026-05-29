import { pool } from "@/lib/db";
import { type SiteBg, DEFAULT_SITE_BG, mergeSiteBgWithDefaults } from "@/domain/entities/SiteBg";

export class SiteBgRepository {
    async get(): Promise<SiteBg> {
        try {
            const { rows } = await pool.query<{ data: Partial<SiteBg> }>(
                `SELECT data FROM public.site_bg WHERE id = 1`,
            );
            if (rows.length === 0) return { ...DEFAULT_SITE_BG };
            return mergeSiteBgWithDefaults(rows[0].data ?? {});
        } catch {
            return { ...DEFAULT_SITE_BG };
        }
    }

    async upsert(bg: SiteBg): Promise<void> {
        await pool.query(
            `INSERT INTO public.site_bg (id, data)
             VALUES (1, $1::jsonb)
             ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
            [JSON.stringify(bg)],
        );
    }
}
