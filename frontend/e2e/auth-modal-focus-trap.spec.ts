import { expect, test } from "@playwright/test";

const FIRST_VISIT_STORAGE_KEY = "pp7ia_has_visited";

async function isFocusInsideDialog(page: import("@playwright/test").Page) {
    return page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return dialog ? dialog.contains(document.activeElement) : false;
    });
}

test.describe("AuthModal focus trap", () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(storageKey => {
            window.localStorage.setItem(storageKey, "true");
        }, FIRST_VISIT_STORAGE_KEY);
    });

    test("foco inicial cai dentro do diálogo ao abrir", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "Entrar" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();

        expect(await isFocusInsideDialog(page)).toBe(true);
    });

    test("Tab e Shift+Tab nunca escapam do diálogo (regressão: foco vazava para 'Quero fazer parte')", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "Entrar" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();

        for (let i = 0; i < 15; i++) {
            await page.keyboard.press("Tab");
            expect(await isFocusInsideDialog(page)).toBe(true);
        }

        for (let i = 0; i < 15; i++) {
            await page.keyboard.press("Shift+Tab");
            expect(await isFocusInsideDialog(page)).toBe(true);
        }
    });

    test("Esc fecha o diálogo e devolve o foco ao gatilho", async ({ page }) => {
        await page.goto("/");
        const trigger = page.getByRole("button", { name: "Entrar" });
        await trigger.click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(dialog).not.toBeVisible();
        await expect(trigger).toBeFocused();
    });
});
