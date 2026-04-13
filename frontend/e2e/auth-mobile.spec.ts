import { expect, test } from "@playwright/test";

const FIRST_VISIT_STORAGE_KEY = "pp7ia_has_visited";

test.describe("Auth mobile UX", () => {
    test.beforeEach(async ({ page }, testInfo) => {
        test.skip(!testInfo.project.use.isMobile, "cenários exclusivos de mobile");

        await page.addInitScript(storageKey => {
            window.localStorage.setItem(storageKey, "true");
        }, FIRST_VISIT_STORAGE_KEY);
    });

    test("entrada mobile abre login e permite alternar para cadastro", async ({ page }) => {
        await page.goto("/");

        await page.getByRole("button", { name: "Entrar" }).click();
        await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();

        await page.locator("form").getByRole("button", { name: "Cadastrar" }).click();

        await expect(page.getByRole("heading", { name: "Cadastrar" })).toBeVisible();
        await expect(page.getByLabel("Nome Completo")).toBeVisible();
        await expect(page.getByLabel("Celular")).toBeVisible();
    });

    test("menu mobile abre navegação sem quebrar auth CTA", async ({ page }) => {
        await page.goto("/");

        await page.getByRole("button", { name: /abrir menu/i }).click();

        await expect(page.getByRole("navigation", { name: "Navegação mobile" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Quem Somos" })).toBeVisible();
        await expect(page.getByRole("link", { name: "O Autor" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    });
});
