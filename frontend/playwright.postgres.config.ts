/**
 * Playwright config para testes E2E com Postgres local.
 *
 * Requer DATABASE_URL apontando para um Postgres de teste com migrations
 * aplicadas. Inicia o dev server na porta 3001 para não conflitar com outro
 * servidor local que possa estar rodando na porta 3000.
 *
 * Uso: DATABASE_URL=postgres://... pnpm run test:e2e:postgres
 */

import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config";

const LOCAL_PORT = 3001;
const LOCAL_BASE_URL = `http://127.0.0.1:${LOCAL_PORT}`;
const LOCAL_DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
const LOCAL_BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? "playwright-local-secret";

// Set env vars in Playwright process so test files and globalSetup read correct values.
process.env.DATABASE_URL = LOCAL_DATABASE_URL;
process.env.BETTER_AUTH_SECRET = LOCAL_BETTER_AUTH_SECRET;
process.env.BETTER_AUTH_URL = LOCAL_BASE_URL;
process.env.NEXT_PUBLIC_SITE_URL = LOCAL_BASE_URL;

const envPrefix = [
    `PORT=${LOCAL_PORT}`,
    `DATABASE_URL=${LOCAL_DATABASE_URL}`,
    `BETTER_AUTH_SECRET=${LOCAL_BETTER_AUTH_SECRET}`,
    `BETTER_AUTH_URL=${LOCAL_BASE_URL}`,
    `NEXT_PUBLIC_SITE_URL=${LOCAL_BASE_URL}`,
].join(" ");

export default defineConfig({
    ...baseConfig,
    timeout: 150000,
    // Sequential execution: local Postgres + Next.js dev server run on shared loopback;
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
