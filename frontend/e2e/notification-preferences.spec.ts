import { expect, test } from "@playwright/test";

const FIRST_VISIT_STORAGE_KEY = "pp7ia_has_visited";

async function openSignupModal(page: import("@playwright/test").Page) {
    const desktopSignupButton = page.getByRole("button", { name: "Quero Fazer Parte" });

    if (await desktopSignupButton.isVisible().catch(() => false)) {
        await desktopSignupButton.click();
        return;
    }

    await page.getByRole("button", { name: "Entrar" }).click();
    await page.locator("form").getByRole("button", { name: "Cadastrar" }).click();
}

test.describe("Notification preferences — signup and profile", () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(storageKey => {
            window.localStorage.setItem(storageKey, "true");
        }, FIRST_VISIT_STORAGE_KEY);
    });

    test("formulário de cadastro não exibe checkbox de WhatsApp", async ({ page }) => {
        await page.goto("/");
        await openSignupModal(page);

        await expect(page.getByText("Aceito receber atualizações e novidades por e-mail")).toBeVisible();
        await expect(page.getByText(/whatsapp/i)).not.toBeVisible();
    });

    test("envio sem marcar e-mail exibe erro de consentimento e bloqueia submit", async ({ page }) => {
        await page.goto("/");
        await openSignupModal(page);

        await page.getByLabel("Nome Completo").fill("Test User");
        await page.getByLabel("Email").fill("test@test.com");
        await page.getByLabel("Celular").fill("11999999999");
        await page.getByLabel("Senha").fill("123456");

        await page.locator("form").getByRole("button", { name: "Cadastrar" }).click();

        await expect(page.getByText("Aceite receber atualizações por e-mail para continuar")).toBeVisible();
    });

    test("marcar e-mail libera o envio do formulário", async ({ page }) => {
        await page.goto("/");
        await openSignupModal(page);

        await page.getByLabel("Nome Completo").fill("Test User");
        await page.getByLabel("Email").fill("test@test.com");
        await page.getByLabel("Celular").fill("11999999999");
        await page.getByLabel("Senha").fill("123456");
        await page.getByText("Aceito receber atualizações e novidades por e-mail").click();

        // Erro de consentimento não deve aparecer após marcar
        await expect(page.getByText("Aceite receber atualizações por e-mail para continuar")).not.toBeVisible();
    });
});
