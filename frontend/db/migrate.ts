/**
 * Apply pending SQL migrations from db/migrations/.
 *
 * Run via: `pnpm exec tsx db/migrate.ts` (locally)
 * or set as Railway "Pre-deploy command":
 *   pnpm exec tsx db/migrate.ts
 *
 * Idempotent: tracks applied filenames in `_migrations` table.
 * Stops on first error (psql -v ON_ERROR_STOP=1 equivalent).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { isRailwayPrEnvironment } from "./environment";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "migrations");

async function main() {
    const railwayEnvironmentName = process.env.RAILWAY_ENVIRONMENT_NAME;
    if (isRailwayPrEnvironment(railwayEnvironmentName)) {
        console.log(`[migrate] skipped in ephemeral Railway PR environment: ${railwayEnvironmentName}`);
        return;
    }

    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL not set");

    const isLocalDatabase = ["localhost", "127.0.0.1", "::1"].includes(new URL(url).hostname);

    const pool = new Pool({
        connectionString: url,
        ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
        max: 2,
    });

    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

        const files = readdirSync(MIGRATIONS_DIR)
            .filter((f) => f.endsWith(".sql"))
            .sort(); // 0001_..., 0002_..., ordered lexically

        if (files.length === 0) {
            console.log("[migrate] no migration files");
            return;
        }

        const { rows: applied } = await pool.query(
            `SELECT filename FROM _migrations`,
        );
        const appliedSet = new Set(applied.map((r) => r.filename));

        const pending = files.filter((f) => !appliedSet.has(f));
        if (pending.length === 0) {
            console.log(`[migrate] up to date (${files.length} applied)`);
            return;
        }

        console.log(`[migrate] applying ${pending.length} migration(s):`);
        for (const file of pending) {
            console.log(`  → ${file}`);
            const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
            const client = await pool.connect();
            try {
                await client.query("BEGIN");
                await client.query(sql);
                await client.query(
                    `INSERT INTO _migrations (filename) VALUES ($1)`,
                    [file],
                );
                await client.query("COMMIT");
                console.log(`    ✓ applied`);
            } catch (err) {
                await client.query("ROLLBACK");
                console.error(`    ✗ failed:`, err);
                throw err;
            } finally {
                client.release();
            }
        }
        console.log(`[migrate] done`);
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    console.error("[migrate] fatal:", err);
    process.exit(1);
});
