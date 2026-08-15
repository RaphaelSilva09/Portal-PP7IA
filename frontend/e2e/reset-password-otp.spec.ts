import { expect, test } from "@playwright/test";

const FIRST_VISIT_STORAGE_KEY = "pp7ia_has_visited";
const TEST_EMAIL = "raphael.silva0907@gmail.com";

test.describe("Reset de senha — digitação do código OTP", () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(storageKey => {
            window.localStorage.setItem(storageKey, "true");
        }, FIRST_VISIT_STORAGE_KEY);

        // Intercepta o envio do OTP para evitar disparo de e-mail real e manter
        // o teste determinístico — o foco aqui é a digitação no campo, não a
        // entrega de e-mail.
        await page.route("**/api/auth/email-otp/send-verification-otp", async route => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({}),
            });
        });
    });

    test("permite digitar o código de 8 dígitos sem perder o foco a cada tecla", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "Entrar" }).click();
        await page.getByRole("button", { name: "Esqueceu sua senha?" }).click();

        await expect(page.getByRole("heading", { name: "Recuperar Senha" })).toBeVisible();

        await page.getByPlaceholder("seu@email.com").fill(TEST_EMAIL);
        await page.getByRole("button", { name: "Enviar código" }).click();

        const otpInput = page.getByPlaceholder("00000000");
        await expect(otpInput).toBeVisible();

        await otpInput.click();
        await page.keyboard.type("12345678", { delay: 50 });

        await expect(otpInput).toHaveValue("12345678");
        await expect(otpInput).toBeFocused();
    });
});
