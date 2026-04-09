import { expect, test } from "@playwright/test";

const FIRST_VISIT_STORAGE_KEY = "pp7ia_has_visited";

test.describe("Auth pristine state", () => {
    test.beforeEach(async ({ context, page }) => {
        await context.clearCookies();
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.sessionStorage.clear();
        });
    });

    test("sem qualquer dado salvo, /user redireciona para login sem conceder acesso", async ({ page }) => {
        await page.goto("/user");

        await expect(page).toHaveURL(/\/(\?authModal=login)?$/);
        await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
    });

    test("sem qualquer dado salvo, primeiro acesso abre o modal de captura inicial", async ({ page }) => {
        await page.goto("/");

        await expect(page.getByRole("heading", { name: "Receba nossa curadoria semanal" })).toBeVisible({ timeout: 4000 });
        await expect(page.locator("#first-visit-email")).toBeVisible();
        await expect(page.locator("#first-visit-celular")).toBeVisible();
    });

    test("sem qualquer dado salvo, first visit encaminha para cadastro pré-preenchido", async ({ page }) => {
        await page.goto("/");

        await expect(page.getByRole("heading", { name: "Receba nossa curadoria semanal" })).toBeVisible({ timeout: 4000 });

        await page.locator("#first-visit-email").fill("primeiro.acesso@example.com");
        await page.locator("#first-visit-celular").fill("11999999999");
        await page.getByRole("button", { name: "Continuar" }).click();

        await expect(page.getByRole("heading", { name: "Cadastrar" })).toBeVisible({ timeout: 4000 });
        await expect(page.getByLabel("Email")).toHaveValue("primeiro.acesso@example.com");
        await expect(page.getByLabel("Celular")).toHaveValue("(11) 99999-9999");
        await expect
            .poll(async () => page.evaluate(key => window.localStorage.getItem(key), FIRST_VISIT_STORAGE_KEY))
            .toBe("true");
    });

    test("sem qualquer dado salvo, fechar o first visit não autentica nem trava a landing", async ({ page }) => {
        await page.goto("/");

        await expect(page.getByRole("heading", { name: "Receba nossa curadoria semanal" })).toBeVisible({ timeout: 4000 });
        await page.getByRole("button", { name: "Fechar modal" }).click();

        await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
        await expect
            .poll(async () => page.evaluate(key => window.localStorage.getItem(key), FIRST_VISIT_STORAGE_KEY))
            .toBe("true");
    });
});
