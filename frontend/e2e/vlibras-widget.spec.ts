import { expect, test } from "@playwright/test";

const VLIBRAS_SCRIPT_SRC = "https://vlibras.gov.br/app/vlibras-plugin.js";

const FIRST_VISIT_STORAGE_KEY = "pp7ia_has_visited";

test.describe("VLibras widget", () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(storageKey => {
            window.localStorage.setItem(storageKey, "true");
        }, FIRST_VISIT_STORAGE_KEY);
    });

    test("script é carregado uma única vez na página inicial", async ({ page }) => {
        await page.goto("/");

        const scriptCount = await page
            .locator(`script[src="${VLIBRAS_SCRIPT_SRC}"]`)
            .count();

        expect(scriptCount).toBe(1);
    });

    test("permanece presente e sem duplicação após navegação client-side", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator(`script[src="${VLIBRAS_SCRIPT_SRC}"]`)).toHaveCount(1);

        await page.goto("/biblioteca");
        await expect(page.locator(`script[src="${VLIBRAS_SCRIPT_SRC}"]`)).toHaveCount(1);

        await page.goto("/");
        await expect(page.locator(`script[src="${VLIBRAS_SCRIPT_SRC}"]`)).toHaveCount(1);
    });

    test("permanece presente após hard reload", async ({ page }) => {
        await page.goto("/");
        await page.reload();

        await expect(page.locator(`script[src="${VLIBRAS_SCRIPT_SRC}"]`)).toHaveCount(1);
    });

    test("indisponibilidade do serviço externo não quebra a página", async ({ page }) => {
        await page.route(VLIBRAS_SCRIPT_SRC, route => route.abort());

        const pageErrors: Error[] = [];
        page.on("pageerror", error => pageErrors.push(error));

        await page.goto("/");

        await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 15000 });
        expect(pageErrors).toHaveLength(0);
    });
});
