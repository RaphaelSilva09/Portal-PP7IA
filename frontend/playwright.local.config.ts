/**
 * Playwright config para testes E2E com Supabase local.
 *
 * Requer: supabase start (containers rodando em 127.0.0.1:54321)
 * Inicia o dev server na porta 3001 para não conflitar com o
 * servidor cloud que pode estar rodando na porta 3000.
 *
 * Uso: pnpm run test:e2e:local
 */

import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config";

const LOCAL_SUPABASE_URL = "http://127.0.0.1:54321";
const LOCAL_SUPABASE_KEY = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";
const LOCAL_SERVICE_KEY = "sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz";
const LOCAL_PORT = 3001;
const LOCAL_BASE_URL = `http://127.0.0.1:${LOCAL_PORT}`;

// Set env vars in Playwright process so test files and globalSetup read correct values
process.env.NEXT_PUBLIC_SUPABASE_URL = LOCAL_SUPABASE_URL;
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = LOCAL_SUPABASE_KEY;
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = LOCAL_SUPABASE_KEY;
process.env.SUPABASE_SERVICE_ROLE_KEY = LOCAL_SERVICE_KEY;
process.env.NEXT_PUBLIC_SITE_URL = LOCAL_BASE_URL;

const envPrefix = [
    `PORT=${LOCAL_PORT}`,
    `NEXT_PUBLIC_SUPABASE_URL=${LOCAL_SUPABASE_URL}`,
    `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${LOCAL_SUPABASE_KEY}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${LOCAL_SUPABASE_KEY}`,
    `SUPABASE_SERVICE_ROLE_KEY=${LOCAL_SERVICE_KEY}`,
    `NEXT_PUBLIC_SITE_URL=${LOCAL_BASE_URL}`,
].join(" ");

export default defineConfig({
    ...baseConfig,
    timeout: 150000,
    // Sequential execution: local Supabase + Next.js dev server run on shared loopback;
    // parallel workers cause middleware getUser() failures under auth load from email tests.
    workers: 1,
    use: {
        ...baseConfig.use,
        baseURL: LOCAL_BASE_URL,
    },
    webServer: {
        command: `${envPrefix} ./node_modules/.bin/next dev --webpack --hostname 127.0.0.1 --port ${LOCAL_PORT}`,
        url: LOCAL_BASE_URL,
        reuseExistingServer: false,
        timeout: 120000,
    },
});
