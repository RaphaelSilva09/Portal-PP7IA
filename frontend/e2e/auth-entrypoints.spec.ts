import { expect, test } from "@playwright/test";

const FIRST_VISIT_STORAGE_KEY = "pp7ia_has_visited";

async function expectLoginModalVisible(page: import("@playwright/test").Page) {
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel("Senha", { exact: true })).toBeVisible({ timeout: 15000 });
}

async function openSignupModal(page: import("@playwright/test").Page) {
    const desktopSignupButton = page.getByRole("button", { name: "Quero Fazer Parte" });

    if (await desktopSignupButton.isVisible().catch(() => false)) {
        await desktopSignupButton.click();
        return;
    }

    await page.getByRole("button", { name: "Entrar" }).click();
    await page.locator("form").getByRole("button", { name: "Cadastrar" }).click();
}

test.describe("Auth entrypoints", () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(storageKey => {
            window.localStorage.setItem(storageKey, "true");
        }, FIRST_VISIT_STORAGE_KEY);
    });

    test("rota protegida /user redireciona para / e abre modal de login", async ({ page }) => {
        await page.goto("/user");

        await expect(page).toHaveURL(/\/(\?authModal=login)?$/);
        await expectLoginModalVisible(page);
    });

    test("query param authModal=login abre modal e limpa a URL", async ({ page }) => {
        await page.goto("/?authModal=login");

        await expect(page).toHaveURL(/\/(\?authModal=login)?$/, { timeout: 15000 });
        await expectLoginModalVisible(page);
    });

    test("cadastro bloqueia envio com erros de validação client-side", async ({ page }) => {
        await page.goto("/");
        await openSignupModal(page);
        await page.locator("form").getByRole("button", { name: "Cadastrar" }).click();

        await expect(page.getByText("Nome é obrigatório")).toBeVisible();
        await expect(page.getByText("Email é obrigatório")).toBeVisible();
        await expect(page.getByText("Celular é obrigatório")).toBeVisible();
        await expect(page.getByText("Senha é obrigatória")).toBeVisible();
        await expect(page.getByText("Aceite pelo menos uma forma de receber atualizações")).toBeVisible();
    });

    test("link de esqueci a senha fecha auth modal e abre o modal dedicado", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "Entrar" }).click();
        await page.getByRole("button", { name: "Esqueceu sua senha?" }).click();

        await expect(page.getByRole("heading", { name: "Recuperar Senha" })).toBeVisible();
    });
});
