import { expect, test } from "@playwright/test";
import { getAuthSessionCookieName } from "./utils/env";

const authCookieName = getAuthSessionCookieName();
const FIRST_VISIT_STORAGE_KEY = "pp7ia_has_visited";

test.describe("Auth session resilience", () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(storageKey => {
            window.localStorage.setItem(storageKey, "true");
        }, FIRST_VISIT_STORAGE_KEY);
    });

    test("localStorage de sessão corrompido não trava a landing page", async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem("better-auth-corrupted-session", "{invalid-json");
        });

        await page.goto("/");

        await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    });

    test("sessão antiga parseável no localStorage não prende a landing page após reload", async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem(
                "better-auth-old-session",
                JSON.stringify({
                    currentSession: {
                        access_token: "expired-access-token",
                        refresh_token: "stale-refresh-token",
                        expires_at: 1,
                        expires_in: 0,
                        token_type: "bearer",
                        user: {
                            id: "stale-user-id",
                            app_metadata: { role: "user" },
                            user_metadata: {},
                            aud: "authenticated",
                            email: "stale@example.com",
                            created_at: new Date(0).toISOString(),
                        },
                    },
                    expiresAt: 1,
                }),
            );
        });

        await page.goto("/");
        await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible({ timeout: 12000 });

        await page.reload();

        await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible({ timeout: 12000 });
    });

    test("payload legado parseável sem formato de sessão não trava a landing page", async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem(
                "better-auth-legacy-session",
                JSON.stringify({
                    legacy: true,
                    user: { id: "old-user", email: "old@example.com" },
                }),
            );
        });

        await page.goto("/");

        await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible({ timeout: 12000 });
    });

    test("cookie de sessão inválido em /home volta para / sem loading infinito", async ({ context, page, baseURL }) => {
        await context.addCookies([
            {
                name: authCookieName,
                value: "stale-session-cookie",
                url: new URL("/", baseURL!).toString(),
            },
        ]);

        await page.goto("/home");

        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    });

    test("cookie inválido + storage antigo não mantêm acesso indevido a /home", async ({ context, page, baseURL }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem(
                "better-auth-old-session",
                JSON.stringify({
                    currentSession: {
                        access_token: "expired-access-token",
                        refresh_token: "stale-refresh-token",
                        expires_at: 1,
                        expires_in: 0,
                        token_type: "bearer",
                    },
                    expiresAt: 1,
                }),
            );
        });

        await context.addCookies([
            {
                name: authCookieName,
                value: "stale-session-cookie",
                url: new URL("/", baseURL!).toString(),
            },
        ]);

        await page.goto("/home");

        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible({ timeout: 12000 });
    });
});
