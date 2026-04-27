import fs from "node:fs";
import path from "node:path";

const ENV_FILES = [".env.local", ".env"];

function readEnvValue(name: string): string | undefined {
    // process.env takes precedence — allows playwright.local.config.ts to override
    if (process.env[name]) return process.env[name];

    for (const fileName of ENV_FILES) {
        const filePath = path.join(process.cwd(), fileName);

        if (!fs.existsSync(filePath)) {
            continue;
        }

        const fileContent = fs.readFileSync(filePath, "utf8");
        const match = fileContent.match(new RegExp(`^${name}=(.*)$`, "m"));

        if (!match) {
            continue;
        }

        return match[1].trim().replace(/^['\"]|['\"]$/g, "");
    }

    return undefined;
}

export function getSupabaseAuthStorageKey(): string {
    const supabaseUrl = readEnvValue("NEXT_PUBLIC_SUPABASE_URL");

    if (!supabaseUrl) {
        return "sb-test-auth-token";
    }

    try {
        const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
        return `sb-${projectRef}-auth-token`;
    } catch {
        return "sb-test-auth-token";
    }
}
