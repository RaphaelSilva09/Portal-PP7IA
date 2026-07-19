import { pool } from "@/lib/db";
import type { HomepageConfig, SectionConfig } from "@/domain/entities/HomepageConfig";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/domain/entities/HomepageConfig";

export class PostgresHomepageConfigRepository {
    async get(): Promise<HomepageConfig> {
        try {
            const { rows } = await pool.query<{ sections: SectionConfig[] }>(
                `SELECT sections FROM public.homepage_config WHERE id = 1`,
            );
            if (rows.length === 0 || !rows[0].sections?.length) {
                return DEFAULT_HOMEPAGE_CONFIG;
            }
            return { sections: rows[0].sections };
        } catch {
            return DEFAULT_HOMEPAGE_CONFIG;
        }
    }

    async upsert(config: HomepageConfig): Promise<void> {
        await pool.query(
            `INSERT INTO public.homepage_config (id, sections)
             VALUES (1, $1::jsonb)
             ON CONFLICT (id) DO UPDATE SET sections = EXCLUDED.sections`,
            [JSON.stringify(config.sections)],
        );
    }
}
