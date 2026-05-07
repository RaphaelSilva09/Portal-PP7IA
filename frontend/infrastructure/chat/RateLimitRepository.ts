import { pool } from "@/lib/db";

export class RateLimitRepository {
    /** Returns the current count for the user today (0 if none). */
    async currentCount(userId: string): Promise<number> {
        const today = new Date().toISOString().slice(0, 10);
        const { rows } = await pool.query<{ count: number }>(
            `SELECT count FROM public.rag_usage WHERE user_id = $1 AND usage_date = $2`,
            [userId, today],
        );
        return rows[0]?.count ?? 0;
    }

    /** Atomically increment via INSERT ... ON CONFLICT DO UPDATE. */
    async increment(userId: string): Promise<void> {
        const today = new Date().toISOString().slice(0, 10);
        await pool.query(
            `
            INSERT INTO public.rag_usage (user_id, usage_date, count)
            VALUES ($1, $2, 1)
            ON CONFLICT (user_id, usage_date)
            DO UPDATE SET count = public.rag_usage.count + 1
            `,
            [userId, today],
        );
    }
}
