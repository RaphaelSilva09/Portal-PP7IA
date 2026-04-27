import { expect, test, type Page } from "@playwright/test";

const TEST_EMAIL = "teste@teste.com";
const TEST_PASSWORD = "testando123";
const FIRST_VISIT_STORAGE_KEY = "pp7ia_has_visited";

// Cookie key: derived from Supabase URL hostname (sb-{hostname[0]}-auth-token)
// See SupabaseClient.ts: `sb-${baseUrl.hostname.split('.')[0]}-auth-token`
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseRef = SUPABASE_URL ? new URL(SUPABASE_URL).hostname.split(".")[0] : "127";
const AUTH_COOKIE_KEY = `sb-${supabaseRef}-auth-token`;

// @supabase/ssr encodes the session JSON as "base64-{base64url(json)}"
const BASE64_PREFIX = "base64-";

async function openLoginModal(page: Page) {
    const entrar = page.getByRole("button", { name: "Entrar" }).first();
    await expect(entrar).toBeVisible({ timeout: 10000 });
    await entrar.click();
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 10000 });
}

async function login(page: Page) {
    await openLoginModal(page);
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Senha", { exact: true }).fill(TEST_PASSWORD);
    await page.locator("form").getByRole("button", { name: "Entrar" }).click();
}

// Sets expires_at to 1 hour in the past so the next getSession() call triggers TOKEN_REFRESHED.
// Returns false if the auth cookie was not found (e.g. different storage mechanism).
async function expireAuthSession(page: Page): Promise<boolean> {
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(
        (c) => c.name === AUTH_COOKIE_KEY || c.name.startsWith(`${AUTH_COOKIE_KEY}.`),
    );

    if (authCookies.length === 0) return false;

    // Prefer the unchunked cookie; fall back to first chunk
    const mainCookie = authCookies.find((c) => c.name === AUTH_COOKIE_KEY) ?? authCookies[0];

    try {
        const raw = mainCookie.value;
        const encoded = raw.startsWith(BASE64_PREFIX) ? raw.slice(BASE64_PREFIX.length) : raw;
        const sessionJson = Buffer.from(encoded, "base64url").toString("utf-8");
        const session = JSON.parse(sessionJson) as { expires_at?: number };

        if (!session.expires_at) return false;

        session.expires_at = Math.floor(Date.now() / 1000) - 3600;

        const newValue = BASE64_PREFIX + Buffer.from(JSON.stringify(session)).toString("base64url");
        await page.context().addCookies([
            {
                name: mainCookie.name,
                value: newValue,
                domain: mainCookie.domain,
                path: mainCookie.path,
                secure: mainCookie.secure,
                httpOnly: mainCookie.httpOnly,
                sameSite: (mainCookie.sameSite ?? "Lax") as "Strict" | "Lax" | "None",
            },
        ]);
        return true;
    } catch {
        return false;
    }
}

test.describe("Auth session recovery", () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript((storageKey) => {
            window.localStorage.setItem(storageKey, "true");
        }, FIRST_VISIT_STORAGE_KEY);
    });

    test("TOKEN_REFRESHED — access_token expirado é renovado automaticamente mantendo a sessão ativa", async ({ page }) => {
        await page.goto("/");
        await login(page);
        await expect(page).toHaveURL(/\/home(\?.*)?$/, { timeout: 15000 });
        await expect(page.getByRole("button", { name: "Sair" })).toBeVisible({ timeout: 10000 });

        // Expire the session in the auth cookie.
        // supabase-js reads expires_at from storage on each __loadSession() call.
        // Setting it to the past makes the next getSession() call trigger _callRefreshToken().
        const expired = await expireAuthSession(page);
        expect(expired, `Auth cookie ${AUTH_COOKIE_KEY} not found — check Supabase URL env var`).toBe(true);

        // Dispatch visibilitychange: SessionContext.handleVisibilityChange calls supabase.auth.getSession().
        // getSession() → __loadSession() → hasExpired=true → _callRefreshToken() →
        // _notifyAllSubscribers('TOKEN_REFRESHED') → onAuthStateChange handler fires →
        // getUserFromSession() → setUser() → setIsLoading(false).
        // safetyTimerRef is cleared in the finally block (the code fixed in this session).
        await page.evaluate(() => {
            document.dispatchEvent(new Event("visibilitychange"));
        });

        // Wait for the async refresh chain to complete:
        // network call to /auth/v1/token (~50ms local) + getUserFromSession DB query + React render
        await page.waitForTimeout(3000);

        // Session was refreshed — user must remain authenticated at /home
        await expect(page.getByRole("button", { name: "Sair" })).toBeVisible({ timeout: 10000 });
        await expect(page).toHaveURL(/\/home(\?.*)?$/);
    });
});
