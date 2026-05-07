/**
 * Playwright globalSetup
 *
 * Garante que o usuário de teste tem um perfil em public.users
 * antes de qualquer spec rodar. O trigger handle_new_user só
 * dispara no signup pelo app — usuários criados manualmente no
 * dashboard ficam sem linha em public.users.
 *
 * A RLS policy "Users can insert own profile" permite INSERT
 * autenticado com auth.uid() = id, então usamos a sessão do
 * próprio usuário para criar o perfil se ele estiver faltando.
 *
 * Em ambiente local (playwright.local.config.ts) o usuário pode
 * não existir ainda — usamos a service role key para criá-lo via
 * admin API antes de prosseguir.
 */

import fs from "node:fs";
import path from "node:path";

const TEST_EMAIL = "teste@teste.com";
const TEST_PASSWORD = "testando123";

const ENV_FILES = [".env.local", ".env"];

function readEnvValue(name: string): string | undefined {
    // process.env takes precedence — allows playwright.local.config.ts to override
    if (process.env[name]) return process.env[name];

    for (const fileName of ENV_FILES) {
        const filePath = path.join(process.cwd(), fileName);
        if (!fs.existsSync(filePath)) continue;
        const match = fs.readFileSync(filePath, "utf8").match(new RegExp(`^${name}=(.*)$`, "m"));
        if (match) return match[1].trim().replace(/^['\"]|['\"]$/g, "");
    }
    return undefined;
}

async function ensureAuthUserExists(supabaseUrl: string, serviceRoleKey: string): Promise<boolean> {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
            "apikey": serviceRoleKey,
            "Authorization": `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            email_confirm: true,
            user_metadata: {
                nome: "Usuário Teste",
                celular: "11999999999",
                accept_email_updates: true,
            },
        }),
    });

    if (res.ok || res.status === 201) {
        console.log(`[globalSetup] Created auth user ${TEST_EMAIL} via admin API`);
        return true;
    }

    const body = await res.text().catch(() => "");
    // 422 = user already exists — that's fine
    if (res.status === 422 || body.includes("already")) {
        return true;
    }

    console.warn(`[globalSetup] Could not create auth user: ${res.status} ${body}`);
    return false;
}

export default async function globalSetup() {
    const supabaseUrl = readEnvValue("NEXT_PUBLIC_SUPABASE_URL");
    const anonKey =
        readEnvValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ??
        readEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const serviceRoleKey = readEnvValue("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey) {
        console.warn("[globalSetup] Supabase env vars not found — skipping test-user profile check");
        return;
    }

    // 1. Authenticate
    let signInRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": anonKey,
        },
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });

    // If sign-in fails and we have a service role key, try creating the user (local Supabase)
    if (!signInRes.ok && serviceRoleKey) {
        console.log(`[globalSetup] Sign-in failed (${signInRes.status}) — attempting admin user creation`);
        const created = await ensureAuthUserExists(supabaseUrl, serviceRoleKey);
        if (created) {
            signInRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": anonKey,
                },
                body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
            });
        }
    }

    if (!signInRes.ok) {
        console.warn(`[globalSetup] Could not sign in as ${TEST_EMAIL}: ${signInRes.status} ${signInRes.statusText}`);
        return;
    }

    const { access_token, user } = await signInRes.json() as {
        access_token: string;
        user: { id: string; email: string };
    };

    if (!access_token || !user?.id) {
        console.warn("[globalSetup] Unexpected sign-in response shape");
        return;
    }

    // 2. Upsert profile with valid test data.
    // The DB trigger handle_new_user() fires when the admin API creates the user, but
    // it uses raw_user_meta_data defaults (celular='', accept_*=false) when no metadata
    // is provided — those values fail User.validate(). Always upsert so we overwrite
    // any trigger-created row that has invalid defaults.
    const upsertApiKey = serviceRoleKey ?? anonKey;
    const upsertToken = serviceRoleKey ?? access_token;
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: "POST",
        headers: {
            "apikey": upsertApiKey,
            "Authorization": `Bearer ${upsertToken}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
            id: user.id,
            email: user.email,
            nome: "Usuário Teste",
            celular: "11999999999",
            accept_email_updates: true,
        }),
    });

    if (insertRes.ok || insertRes.status === 201) {
        console.log(`[globalSetup] Profile upserted for ${TEST_EMAIL}`);
    } else {
        const body = await insertRes.text().catch(() => "");
        console.warn(`[globalSetup] Failed to create profile: ${insertRes.status} ${body}`);
    }
}
