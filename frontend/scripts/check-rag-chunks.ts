/**
 * Debug: counts rag_chunks by source_type and shows sample meta chunks.
 *
 * Usage:
 *   DATABASE_URL="..." pnpm exec tsx scripts/check-rag-chunks.ts
 */
import { readFileSync } from "node:fs";
import path from "node:path";

function loadDotEnvLocal() {
    try {
        const content = readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
        for (const rawLine of content.split("\n")) {
            const line = rawLine.trim();
            if (!line || line.startsWith("#")) continue;
            const eq = line.indexOf("=");
            if (eq === -1) continue;
            const key = line.slice(0, eq).trim();
            let value = line.slice(eq + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (process.env[key] === undefined) process.env[key] = value;
        }
    } catch { /* no .env.local */ }
}

loadDotEnvLocal();

import { pool } from "@/lib/db";

async function main() {
    const { rows: counts } = await pool.query(
        "SELECT source_type, count(*)::int AS n FROM public.rag_chunks GROUP BY source_type ORDER BY source_type",
    );
    console.log("\n=== Chunks by source_type ===");
    for (const r of counts as { source_type: string; n: number }[]) {
        console.log(`  ${r.source_type}: ${r.n}`);
    }

    const { rows: samples } = await pool.query(
        `SELECT source_type, source_id, content, metadata
         FROM public.rag_chunks WHERE source_type = 'meta_summary' LIMIT 2`,
    );
    console.log("\n=== meta_summary samples ===");
    for (const r of samples as { source_type: string; source_id: string; content: string; metadata: Record<string, unknown> }[]) {
        console.log(`  source_id: ${r.source_id}`);
        console.log(`  metadata: ${JSON.stringify(r.metadata)}`);
        console.log(`  content: ${r.content.slice(0, 300)}`);
        console.log("---");
    }

    const { rows: globals } = await pool.query(
        `SELECT source_type, source_id, content, metadata
         FROM public.rag_chunks WHERE source_type = 'meta_global' LIMIT 2`,
    );
    console.log("\n=== meta_global samples ===");
    for (const r of globals as { source_type: string; source_id: string; content: string; metadata: Record<string, unknown> }[]) {
        console.log(`  metadata: ${JSON.stringify(r.metadata)}`);
        console.log(`  content: ${r.content.slice(0, 300)}`);
        console.log("---");
    }

    await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
