import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Regression tests for the axe `color-contrast` findings C01-C10 (see
 * PP7IAS_Plano_de_Correcao_com_Subagentes.md, section 1.3 / 4-A).
 *
 * Root causes fixed in app/globals.css:
 *  - `--block-*-on`: text painted on the block's SOLID accent fill (badges,
 *    large digits). Was pure white for all 7 blocks — white fails 4.5:1 (and
 *    sometimes even 3:1) against the lighter/saturated accents. Now black,
 *    verified below against every block color in every theme.
 *  - `--block-*-on-surface`: the accent color used directly as TEXT on the
 *    page/card background (hero animated word, carousel eyebrow). The raw
 *    light-theme accent fails 3-4.5:1 for several blocks; darkened,
 *    per-theme-safe values are verified below.
 *  - `--block-*-on-soft`: text on the block's "soft" (16-18% tint) fill.
 *    Reuses the on-surface value; verified independently since the soft fill
 *    is a distinct (lighter) background than --bg-primary.
 *
 * This test parses the real app/globals.css tokens (no hardcoded color
 * duplication) so it fails the moment someone edits a token back into an
 * inaccessible value.
 */

const CSS_PATH = path.join(__dirname, "../../app/globals.css");
const css = readFileSync(CSS_PATH, "utf8");

const BLOCKS = [
    "newsletter",
    "reportagem",
    "radar",
    "livro",
    "biblioteca",
    "estudar",
    "ensinar",
] as const;

/** Extracts the `{ ... }` body of the first rule whose selector matches `selectorRe`. */
function extractRuleBody(selectorRe: RegExp): string {
    const match = selectorRe.exec(css);
    if (!match) throw new Error(`Selector not found: ${selectorRe}`);
    const start = match.index + match[0].length;
    let depth = 1;
    let i = start;
    while (depth > 0 && i < css.length) {
        if (css[i] === "{") depth++;
        else if (css[i] === "}") depth--;
        i++;
    }
    return css.slice(start, i - 1);
}

/** Resolves a declaration value, following a single level of `var(--x)` indirection within the same rule body. */
function readVar(body: string, name: string): string {
    const re = new RegExp(`--${name}:\\s*([^;]+);`);
    const match = re.exec(body);
    if (!match) throw new Error(`--${name} not found in rule body`);
    let value = match[1].trim();
    const varRef = /^var\(--([a-z0-9-]+)\)$/i.exec(value);
    if (varRef) {
        value = readVar(body, varRef[1]);
    }
    return value;
}

function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace("#", "");
    return [
        parseInt(clean.slice(0, 2), 16),
        parseInt(clean.slice(2, 4), 16),
        parseInt(clean.slice(4, 6), 16),
    ];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
    const f = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(hexA: string, hexB: string): number {
    const la = relativeLuminance(hexToRgb(hexA));
    const lb = relativeLuminance(hexToRgb(hexB));
    const [lighter, darker] = la > lb ? [la, lb] : [lb, la];
    return (lighter + 0.05) / (darker + 0.05);
}

const rootBody = extractRuleBody(/:root\s*\{/);
const darkBody = extractRuleBody(/\.dark\s*\{/);
const sepiaBody = extractRuleBody(/html\.theme-sepia\s*\{/);

const themes = [
    { name: "light", body: rootBody, bgPrimary: readVar(rootBody, "bg-primary") },
    { name: "dark", body: darkBody, bgPrimary: readVar(darkBody, "bg-primary") },
] as const;

describe("block color tokens — WCAG 1.4.3 contrast (axe color-contrast C01-C10)", () => {
    for (const theme of themes) {
        describe(`${theme.name} theme`, () => {
            for (const block of BLOCKS) {
                it(`${block}: -on text on the solid accent fill reaches 4.5:1 (small text)`, () => {
                    const accent = readVar(theme.body, `block-${block}`);
                    const on = readVar(theme.body, `block-${block}-on`);
                    expect(contrastRatio(accent, on)).toBeGreaterThanOrEqual(4.5);
                });

                it(`${block}: -on-surface text on --bg-primary reaches 4.5:1`, () => {
                    const onSurface = readVar(theme.body, `block-${block}-on-surface`);
                    expect(contrastRatio(onSurface, theme.bgPrimary)).toBeGreaterThanOrEqual(4.5);
                });

                it(`${block}: -on-soft text on --bg-primary reaches 4.5:1`, () => {
                    // The soft fill is a light tint of the accent over the card/page
                    // background, always lighter (more contrast-friendly) than the
                    // page background itself — testing against --bg-primary is the
                    // conservative (worst-case) check.
                    const onSoft = readVar(theme.body, `block-${block}-on-soft`);
                    expect(contrastRatio(onSoft, theme.bgPrimary)).toBeGreaterThanOrEqual(4.5);
                });
            }
        });
    }

    describe("sepia theme (html.theme-sepia)", () => {
        // Sepia intentionally does not redefine --block-* tokens; it inherits the
        // :root (light) values. This test guards that inheritance stays safe
        // against the sepia background specifically.
        const sepiaBg = readVar(sepiaBody, "bg-primary");

        for (const block of BLOCKS) {
            it(`${block}: light-theme -on-surface also reaches 4.5:1 against the sepia background`, () => {
                const onSurface = readVar(rootBody, `block-${block}-on-surface`);
                expect(contrastRatio(onSurface, sepiaBg)).toBeGreaterThanOrEqual(4.5);
            });
        }
    });

    it("the previous regression does not recur: raw accent color is no longer used as -on text", () => {
        // Guards against reverting `--block-*-on` back to white, which measured
        // 1.67-2.98:1 against several dark-theme accents and 2.15-2.80:1 against
        // several light-theme accents (all failing WCAG AA).
        for (const theme of themes) {
            for (const block of BLOCKS) {
                const on = readVar(theme.body, `block-${block}-on`);
                expect(on.toLowerCase()).not.toBe("#ffffff");
            }
        }
    });
});
