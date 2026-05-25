import { pool } from "@/lib/db";
import {
    type BlockColors,
    DEFAULT_BLOCK_COLORS,
    mergeWithDefaults,
} from "@/domain/entities/BlockColors";

export class BlockColorsRepository {
    async get(): Promise<BlockColors> {
        try {
            const { rows } = await pool.query<{ colors: Partial<BlockColors> }>(
                `SELECT colors FROM public.block_colors WHERE id = 1`,
            );
            if (rows.length === 0) return { ...DEFAULT_BLOCK_COLORS };
            return mergeWithDefaults(rows[0].colors ?? {});
        } catch {
            return { ...DEFAULT_BLOCK_COLORS };
        }
    }

    async upsert(colors: BlockColors): Promise<void> {
        await pool.query(
            `INSERT INTO public.block_colors (id, colors)
             VALUES (1, $1::jsonb)
             ON CONFLICT (id) DO UPDATE SET colors = EXCLUDED.colors`,
            [JSON.stringify(colors)],
        );
    }
}
