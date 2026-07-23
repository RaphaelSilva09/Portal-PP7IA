/**
 * Playwright globalSetup
 *
 * Garante que o usuário de teste existe nas tabelas do BetterAuth antes
 * das specs de login. O setup usa Postgres direto para evitar disparos de
 * e-mail e manter o fluxo de teste independente de provedores externos.
 */

import fs from "node:fs";
import path from "node:path";
import { hash as argonHash } from "@node-rs/argon2";
import { Pool } from "pg";

const TEST_EMAIL = "teste@teste.com";
const TEST_PASSWORD = "testando123";

const ENV_FILES = [".env.local", ".env"];

function readEnvValue(name: string): string | undefined {
    // process.env takes precedence, allowing Playwright configs to override files.
    if (process.env[name]) return process.env[name];

    for (const fileName of ENV_FILES) {
        const filePath = path.join(process.cwd(), fileName);
        if (!fs.existsSync(filePath)) continue;
        const match = fs.readFileSync(filePath, "utf8").match(new RegExp(`^${name}=(.*)$`, "m"));
        if (match) return match[1].trim().replace(/^['\"]|['\"]$/g, "");
    }
    return undefined;
}

export default async function globalSetup() {
    const databaseUrl = readEnvValue("DATABASE_URL");

    if (!databaseUrl) {
        console.warn("[globalSetup] DATABASE_URL not found; skipping test user seed");
        return;
    }

    const pool = new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
            ? false
            : { rejectUnauthorized: false },
    });

    try {
        const passwordHash = await argonHash(TEST_PASSWORD);
        const { rows } = await pool.query<{ id: string }>(
            `INSERT INTO "user" (
                "name",
                "email",
                "emailVerified",
                "nome",
                "celular",
                "accept_email_updates",
                "accept_whatsapp_updates",
                "role",
                "updatedAt"
            )
            VALUES ($1, $2, true, $1, $3, true, false, 'user', now())
            ON CONFLICT ("email") DO UPDATE
            SET "name" = EXCLUDED."name",
                "emailVerified" = true,
                "nome" = EXCLUDED."nome",
                "celular" = EXCLUDED."celular",
                "accept_email_updates" = true,
                "accept_whatsapp_updates" = false,
                "role" = COALESCE("user"."role", 'user'),
                "updatedAt" = now()
            RETURNING "id"`,
            ["Usuário Teste", TEST_EMAIL, "11999999999"],
        );

        const userId = rows[0]?.id;
        if (!userId) throw new Error("User seed did not return an id");

        const existingAccount = await pool.query<{ id: string }>(
            `SELECT "id" FROM "account"
             WHERE "accountId" = $1
               AND "providerId" = 'credential'
               AND "userId" = $2
             LIMIT 1`,
            [TEST_EMAIL, userId],
        );

        if (existingAccount.rows[0]?.id) {
            await pool.query(
                `UPDATE "account"
                 SET "password" = $2,
                     "updatedAt" = now()
                 WHERE "id" = $1`,
                [existingAccount.rows[0].id, passwordHash],
            );
        } else {
            await pool.query(
                `INSERT INTO "account" (
                    "accountId",
                    "providerId",
                    "userId",
                    "password",
                    "updatedAt"
                )
                VALUES ($1, 'credential', $2, $3, now())`,
                [TEST_EMAIL, userId, passwordHash],
            );
        }

        console.log(`[globalSetup] BetterAuth test user ready: ${TEST_EMAIL}`);
    } catch (error) {
        console.warn("[globalSetup] Could not seed BetterAuth test user:", error);
    } finally {
        await pool.end();
    }
}
