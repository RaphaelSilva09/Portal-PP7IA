import { expect, test } from "@playwright/test";

const TEST_EMAIL = "teste@teste.com";
const TEST_PASSWORD = "testando123";
const FIRST_VISIT_STORAGE_KEY = "pp7ia_has_visited";

async function openLoginModal(page: import("@playwright/test").Page) {
    const entrar = page.getByRole("button", { name: "Entrar" }).first();
    await expect(entrar).toBeVisible({ timeout: 10000 });
    await entrar.click();
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 10000 });
}

async function login(page: import("@playwright/test").Page) {
    await openLoginModal(page);
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Senha", { exact: true }).fill(TEST_PASSWORD);
    await page.locator("form").getByRole("button", { name: "Entrar" }).click();
}

test.describe("Auth login flow (credenciais reais)", () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(storageKey => {
            window.localStorage.setItem(storageKey, "true");
        }, FIRST_VISIT_STORAGE_KEY);
    });

    test("login com credenciais válidas navega para /home sem redirect prematuro", async ({ page }) => {
        await page.goto("/");
        await login(page);

        // A rota /home deve ser atingida sem passar por / novamente (race condition do fix)
        await expect(page).toHaveURL(/\/home(\?.*)?$/, { timeout: 15000 });

        // UI autenticada deve estar visível
        await expect(page.getByRole("button", { name: "Sair" })).toBeVisible({ timeout: 10000 });
    });

    test("usuário autenticado acessa /user e permanece na rota (não redireciona para login)", async ({ page }) => {
        await page.goto("/");
        await login(page);
        await expect(page).toHaveURL(/\/home(\?.*)?$/, { timeout: 15000 });

        await page.goto("/user");

        // Deve permanecer em /user — route guard não deve disparar com isLoading=true&&user=null
        await expect(page).toHaveURL(/\/user(\?.*)?$/, { timeout: 10000 });
        await expect(page.getByRole("button", { name: "Sair" })).toBeVisible({ timeout: 10000 });
    });

    test("logout redireciona para landing e exibe botão Entrar", async ({ page }) => {
        await page.goto("/");
        await login(page);
        await expect(page).toHaveURL(/\/home(\?.*)?$/, { timeout: 15000 });

        const sairButton = page.getByRole("button", { name: "Sair" });
        await expect(sairButton).toBeVisible({ timeout: 10000 });
        await sairButton.click();

        await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible({ timeout: 10000 });
        await expect(page).not.toHaveURL(/\/home/);
    });

    test("login com credenciais inválidas exibe erro e mantém modal aberto", async ({ page }) => {
        await page.goto("/");
        await openLoginModal(page);
        await page.getByLabel("Email").fill("naoexiste@invalido.com");
        await page.getByLabel("Senha", { exact: true }).fill("senhaerrada");
        await page.locator("form").getByRole("button", { name: "Entrar" }).click();

        // Modal deve continuar aberto com mensagem de erro
        await expect(page.getByLabel("Email")).toBeVisible({ timeout: 10000 });
        const errorText = page.getByRole("alert").or(page.locator("[data-testid='error']")).or(
            page.getByText(/credenciais|inválid|incorret|erro/i)
        ).first();
        await expect(errorText).toBeVisible({ timeout: 10000 });
    });

    test("reload em /home com sessão ativa mantém usuário autenticado", async ({ page }) => {
        await page.goto("/");
        await login(page);
        await expect(page).toHaveURL(/\/home(\?.*)?$/, { timeout: 15000 });

        await page.reload();

        await expect(page).toHaveURL(/\/home(\?.*)?$/, { timeout: 15000 });
        await expect(page.getByRole("button", { name: "Sair" })).toBeVisible({ timeout: 12000 });
    });
});
