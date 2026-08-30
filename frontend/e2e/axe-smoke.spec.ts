import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Fixture for Front F (QA independente) — PP7IAS_Plano_de_Correcao_com_Subagentes.md,
 * section 5 (matriz mínima de verificação) and section 4 ("F — QA independente").
 *
 * Smoke-level axe scans on the pages listed in the verification matrix. This does NOT
 * replace the per-front, per-component evidence Front A/B owe for C01-C10 and ASES —
 * it is a regression net: nothing here should get WORSE while A-E work in parallel
 * worktrees. `incomplete` results are logged, never treated as pass.
 *
 * Known-baseline finding (section 1.3): color-contrast violations are expected here
 * before Front A's fix lands. This suite records them as evidence, it does not fail
 * the run on that specific known rule so the harness stays usable as a general
 * regression gate for OTHER rules while A is still in flight. Front A must additionally
 * prove C01-C10 fixed with its own before/after evidence per the contract in section 4.
 */

const FIRST_VISIT_STORAGE_KEY = "pp7ia_has_visited";
const KNOWN_BASELINE_RULES = ["color-contrast"];

async function runAxe(page: import("@playwright/test").Page) {
    return new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
}

function reportAndAssert(results: Awaited<ReturnType<typeof runAxe>>, label: string) {
    const unexpected = results.violations.filter(
        v => (v.impact === "serious" || v.impact === "critical") && !KNOWN_BASELINE_RULES.includes(v.id),
    );
    const known = results.violations.filter(v => KNOWN_BASELINE_RULES.includes(v.id));

    if (known.length > 0) {
        console.log(`[${label}] known-baseline violations (Front A scope):`, known.map(v => `${v.id} (${v.nodes.length} nós)`));
    }
    if (results.incomplete.length > 0) {
        console.log(`[${label}] axe incomplete (needs-review, não tratar como aprovação):`, results.incomplete.map(i => i.id));
    }
    if (unexpected.length > 0) {
        console.log(`[${label}] unexpected violations:`, JSON.stringify(unexpected, null, 2));
    }
    expect(unexpected, `[${label}] violações serious/critical não relacionadas ao baseline conhecido`).toEqual([]);
}

test.describe("Axe smoke — matriz de verificação (seção 5)", () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(storageKey => {
            window.localStorage.setItem(storageKey, "true");
        }, FIRST_VISIT_STORAGE_KEY);
    });

    test("home (/) — estado inicial", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle").catch(() => {});
        reportAndAssert(await runAxe(page), "home");
    });

    test("/explorar — estado inicial", async ({ page }) => {
        await page.goto("/explorar");
        await page.waitForLoadState("networkidle").catch(() => {});
        // /explorar segue com atualizações client-side (filtros/consulta) após o load
        // inicial; um axe.analyze() disparado durante essa transição perde o contexto
        // de execução. Aguardar um elemento estável do resultado antes de escanear.
        await page.locator("main, [data-testid='explorar-content'], body").first().waitFor({ state: "visible" });
        await page.waitForTimeout(500);
        reportAndAssert(await runAxe(page), "explorar");
    });

    test("/declaracoes", async ({ page }) => {
        await page.goto("/declaracoes");
        await page.waitForLoadState("networkidle").catch(() => {});
        reportAndAssert(await runAxe(page), "declaracoes");
    });

    test("/faq", async ({ page }) => {
        await page.goto("/faq");
        await page.waitForLoadState("networkidle").catch(() => {});
        reportAndAssert(await runAxe(page), "faq");
    });

    test("home — tema escuro, se alternável", async ({ page }) => {
        await page.goto("/");
        const themeToggle = page.getByRole("button", { name: /tema|theme|modo escuro|modo claro/i }).first();
        if (await themeToggle.isVisible().catch(() => false)) {
            await themeToggle.click();
        }
        await page.waitForLoadState("networkidle").catch(() => {});
        reportAndAssert(await runAxe(page), "home-tema-alternado");
    });
});
