/**
 * Mirror all Supabase Storage buckets to STORAGE_ROOT (Railway Volume).
 *
 * Idempotent: skips files that already exist on disk with matching size.
 * Recursive: walks each bucket's full prefix tree.
 *
 * Run locally: writes to ./data
 *   pnpm exec tsx scripts/migrate-storage.ts
 *
 * Run on Railway against the mounted volume:
 *   railway run pnpm exec tsx scripts/migrate-storage.ts
 *
 * Required env (already in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   STORAGE_ROOT (defaults to ./data)
 */
import { createClient } from "@supabase/supabase-js";
import { promises as fs, readFileSync } from "node:fs";
import path from "node:path";

// Auto-load .env.local so the script works without `env VAR=...` prefixing.
// Process.env entries already set externally win (Railway prod sets them at runtime).
function loadDotEnvLocal() {
    try {
        const envPath = path.resolve(process.cwd(), ".env.local");
        const content = readFileSync(envPath, "utf8");
        for (const rawLine of content.split("\n")) {
            const line = rawLine.trim();
            if (!line || line.startsWith("#")) continue;
            const eq = line.indexOf("=");
            if (eq === -1) continue;
            const key = line.slice(0, eq).trim();
            let value = line.slice(eq + 1).trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            if (process.env[key] === undefined) process.env[key] = value;
        }
    } catch {
        // No .env.local — fall through; vars must be set externally.
    }
}
loadDotEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_ROOT = process.env.STORAGE_ROOT ?? "./data";

if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error("[migrate-storage] missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
});

interface SupabaseObject {
    name: string;
    id: string | null;       // null for folders
    metadata: { size?: number } | null;
}

const PAGE_SIZE = 1000;

async function listRecursive(bucket: string, prefix = ""): Promise<{ key: string; size: number }[]> {
    const out: { key: string; size: number }[] = [];
    let offset = 0;

    while (true) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(prefix, { limit: PAGE_SIZE, offset });
        if (error) throw new Error(`list(${bucket}/${prefix}): ${error.message}`);
        const entries = (data ?? []) as SupabaseObject[];
        if (entries.length === 0) break;

        for (const e of entries) {
            const fullKey = prefix ? `${prefix}/${e.name}` : e.name;
            if (e.id === null) {
                // Folder — recurse.
                const nested = await listRecursive(bucket, fullKey);
                out.push(...nested);
            } else {
                out.push({ key: fullKey, size: e.metadata?.size ?? 0 });
            }
        }
        if (entries.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
    }
    return out;
}

async function downloadOne(bucket: string, key: string, destAbs: string): Promise<void> {
    const { data, error } = await supabase.storage.from(bucket).download(key);
    if (error || !data) throw new Error(`download(${bucket}/${key}): ${error?.message ?? "no body"}`);

    await fs.mkdir(path.dirname(destAbs), { recursive: true });
    const buf = Buffer.from(await data.arrayBuffer());
    await fs.writeFile(destAbs, buf);
}

async function main() {
    const root = path.resolve(STORAGE_ROOT);
    await fs.mkdir(root, { recursive: true });

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw new Error(`listBuckets: ${bucketsError.message}`);
    if (!buckets || buckets.length === 0) {
        console.log("[migrate-storage] no buckets to copy");
        return;
    }

    console.log(`[migrate-storage] target: ${root}`);
    console.log(`[migrate-storage] buckets: ${buckets.map(b => b.name).join(", ")}`);

    let totalCopied = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    for (const bucket of buckets) {
        console.log(`\n→ bucket: ${bucket.name}`);
        const objects = await listRecursive(bucket.name);
        console.log(`  ${objects.length} object(s)`);

        for (const obj of objects) {
            const destAbs = path.resolve(root, bucket.name, obj.key);

            // Skip if file exists with matching size.
            try {
                const stat = await fs.stat(destAbs);
                if (stat.size === obj.size) {
                    totalSkipped++;
                    continue;
                }
            } catch {
                // Doesn't exist — fall through.
            }

            try {
                await downloadOne(bucket.name, obj.key, destAbs);
                totalCopied++;
                if (totalCopied % 50 === 0) {
                    console.log(`  ${totalCopied} copied so far…`);
                }
            } catch (err) {
                totalFailed++;
                console.error(`  FAIL ${bucket.name}/${obj.key}: ${(err as Error).message}`);
            }
        }
    }

    console.log(`\n[migrate-storage] done: copied=${totalCopied} skipped=${totalSkipped} failed=${totalFailed}`);
    if (totalFailed > 0) process.exit(1);
}

main().catch(err => {
    console.error("[migrate-storage] fatal:", err);
    process.exit(1);
});
