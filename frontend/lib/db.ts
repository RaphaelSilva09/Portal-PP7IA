import { Pool } from "pg";

declare global {
    var __pgPool: Pool | undefined;
}

const databaseUrl = process.env.DATABASE_URL ?? "";
const isLocalDatabase = databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");

export const pool: Pool =
    globalThis.__pgPool ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30_000,
        ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
    });

if (process.env.NODE_ENV !== "production") {
    globalThis.__pgPool = pool;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    params?: unknown[],
): Promise<T[]> {
    const { rows } = await pool.query<T>(text, params);
    return rows;
}
