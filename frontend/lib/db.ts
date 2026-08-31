import { Pool } from "pg";

declare global {
    var __pgPool: Pool | undefined;
}

const LOCAL_DB_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isLocalDatabaseUrl(url: string): boolean {
    try {
        return LOCAL_DB_HOSTS.has(new URL(url).hostname);
    } catch {
        return false;
    }
}

const isLocalDatabase = isLocalDatabaseUrl(process.env.DATABASE_URL ?? "");

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
