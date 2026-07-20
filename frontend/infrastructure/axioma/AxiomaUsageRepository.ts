import { pool } from "@/lib/db";
import type { IAxiomaUsageRepository } from "@/domain/axioma/IAxiomaUsageRepository";

export class AxiomaUsageRepository implements IAxiomaUsageRepository {
    async getUsageCount(ip: string): Promise<number> {
        const today = new Date().toISOString().slice(0, 10);
        const { rows } = await pool.query<{ count: number }>(
            `SELECT count FROM public.axioma_usage WHERE ip_address = $1 AND usage_date = $2`,
            [ip, today],
        );
        return rows[0]?.count ?? 0;
    }

    async incrementUsage(ip: string): Promise<void> {
        const today = new Date().toISOString().slice(0, 10);
        await pool.query(
            `
            INSERT INTO public.axioma_usage (ip_address, usage_date, count)
            VALUES ($1, $2, 1)
            ON CONFLICT (ip_address, usage_date)
            DO UPDATE SET count = public.axioma_usage.count + 1
            `,
            [ip, today],
        );
    }
}
