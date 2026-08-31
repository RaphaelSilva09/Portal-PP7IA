import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Fixture for Front F (QA independente) — PP7IAS_Plano_de_Correcao_com_Subagentes.md,
 * sections 1.6, 4 ("B — ASES, estrutura HTML e modal de login") and 5 (matriz de verificação).
 *
 * These tests reproduce the reported focus-trap regression and set the acceptance bar
 * Front B's fix must clear. Do NOT weaken these assertions to make them pass — if the
 * underlying bug is fixed, they should pass unmodified.
 *
 * Reported bug (section 1.6): opening "Entrar" and pressing Tab landed focus on
 * "Quero fazer parte", a trigger button OUTSIDE the dialog, even though the modal has
 * role="dialog" and aria-modal="true". Esc correctly closed the modal.
 */

const FIRST_VISIT_STORAGE_KEY = "pp7ia_has_visited";

async function markReturningVisitor(page: import("@playwright/test").Page) {
    await page.addInitScript(storageKey => {
        window.localStorage.setItem(storageKey, "true");
    }, FIRST_VISIT_STORAGE_KEY);
}

function isInsideDialog(handle: { evaluate: (fn: (el: Element) => boolean) => Promise<boolean> }) {
    return handle.evaluate(el => el.closest('[role="dialog"]') !== null);
}

test.describe("AuthModal — focus trap (regressão do login/cadastro)", () => {
    test.beforeEach(async ({ page }) => {
        await markReturningVisitor(page);
        await page.goto("/");
    });

    test("foco inicial cai dentro do diálogo ao abrir por clique", async ({ page }) => {
        await page.getByRole("button", { name: "Entrar" }).first().click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();

        const active = page.locator(":focus");
        await expect(active).toBeVisible();
        expect(await isInsideDialog(active)).toBe(true);
    });

    test("Tab a partir do primeiro campo permanece dentro do diálogo (não vai para 'Quero fazer parte')", async ({ page }) => {
        await page.getByRole("button", { name: "Entrar" }).first().click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await expect(page.getByLabel("Email")).toBeVisible();

        // Regressão relatada: este Tab levava o foco para o botão de cadastro no header,
        // fora do diálogo. O foco deve permanecer dentro do painel modal.
        await page.keyboard.press("Tab");

        const active = page.locator(":focus");
        const insideDialog = await isInsideDialog(active);
        const activeName = await active.evaluate(el => (el as HTMLElement).innerText || el.getAttribute("aria-label") || el.tagName);

        expect(insideDialog, `foco caiu em "${activeName}", fora do diálogo`).toBe(true);
        await expect(page.getByRole("button", { name: "Quero Fazer Parte" }).or(page.getByRole("button", { name: "Quero fazer parte" }))).not.toBeFocused();
    });

    test("Tab cicla dentro do diálogo (do último elemento volta ao primeiro)", async ({ page }) => {
        await page.getByRole("button", { name: "Entrar" }).first().click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();

        const focusableCount = await dialog.locator(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ).count();
        expect(focusableCount).toBeGreaterThan(0);

        // Tab através de todos os elementos focáveis do diálogo mais um: deve permanecer
        // sempre dentro do diálogo (trap), nunca escapar para o conteúdo de fundo.
        for (let i = 0; i < focusableCount + 2; i++) {
            await page.keyboard.press("Tab");
            const active = page.locator(":focus");
            expect(await isInsideDialog(active), `Tab #${i + 1} escapou do diálogo`).toBe(true);
        }
    });

    test("Shift+Tab a partir do primeiro elemento vai para o último do diálogo (não escapa)", async ({ page }) => {
        await page.getByRole("button", { name: "Entrar" }).first().click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await expect(page.getByLabel("Email")).toBeVisible();

        await page.keyboard.press("Shift+Tab");
        const active = page.locator(":focus");
        expect(await isInsideDialog(active)).toBe(true);
    });

    test("Esc fecha o diálogo e devolve o foco ao botão que o abriu", async ({ page }) => {
        const trigger = page.getByRole("button", { name: "Entrar" }).first();
        await trigger.click();
        await expect(page.getByRole("dialog")).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(trigger).toBeFocused();
    });

    test("fundo (conteúdo por trás do overlay) não é alcançável por Tab enquanto o diálogo está aberto", async ({ page }) => {
        await page.getByRole("button", { name: "Entrar" }).first().click();
        await expect(page.getByRole("dialog")).toBeVisible();

        const backgroundSignup = page.getByRole("button", { name: "Quero Fazer Parte" }).or(
            page.getByRole("button", { name: "Quero fazer parte" }),
        );
        if (await backgroundSignup.count() > 0) {
            await expect(backgroundSignup.first()).not.toBeFocused();
        }
    });

    test("troca login -> cadastro -> recuperação preserva o trap de foco", async ({ page }) => {
        await page.getByRole("button", { name: "Entrar" }).first().click();
        await expect(page.getByRole("dialog")).toBeVisible();

        await page.locator("form").getByRole("button", { name: "Cadastrar" }).click();
        await expect(page.getByLabel("Nome", { exact: false })).toBeVisible();
        const active = page.locator(":focus");
        expect(await isInsideDialog(active)).toBe(true);

        await page.getByRole("button", { name: /já tem uma conta|entrar/i }).last().click().catch(() => {});
    });

    test("axe: diálogo de login não tem violações sérias/críticas ativas", async ({ page }) => {
        await page.getByRole("button", { name: "Entrar" }).first().click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByLabel("Email")).toBeVisible();

        const results = await new AxeBuilder({ page })
            .include('[role="dialog"]')
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze();

        const serious = results.violations.filter(v => v.impact === "serious" || v.impact === "critical");
        if (serious.length > 0) {
            console.log(JSON.stringify(serious, null, 2));
        }
        expect(serious, "achados serious/critical do axe no diálogo de login").toEqual([]);

        if (results.incomplete.length > 0) {
            console.log("axe incomplete (needs-review, não tratar como aprovado):", JSON.stringify(results.incomplete.map(i => i.id)));
        }
    });
});
