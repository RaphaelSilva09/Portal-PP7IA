import { pool } from "@/lib/db";
import type { ExplorarConfig } from "@/domain/entities/ExplorarConfig";
import { DEFAULT_EXPLORAR_CONFIG } from "@/domain/entities/ExplorarConfig";

export class ExplorarConfigRepository {
    async get(): Promise<ExplorarConfig> {
        try {
            const { rows } = await pool.query<{ data: ExplorarConfig }>(
                `SELECT data FROM public.explorar_config WHERE id = 1`,
            );
            if (rows.length === 0 || !rows[0].data?.hero) {
                return DEFAULT_EXPLORAR_CONFIG;
            }
            return rows[0].data;
        } catch {
            return DEFAULT_EXPLORAR_CONFIG;
        }
    }

    async upsert(config: ExplorarConfig): Promise<void> {
        await pool.query(
            `INSERT INTO public.explorar_config (id, data)
             VALUES (1, $1::jsonb)
             ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
            [JSON.stringify(config)],
        );
    }
}
