import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
    applyPortalFontScale,
    DEFAULT_PORTAL_FONT_SCALE,
    loadPortalFontScale,
    PORTAL_FONT_SCALE_MAX,
    PORTAL_FONT_SCALE_MIN,
    PORTAL_FONT_SCALE_STORAGE_KEY,
    sanitizePortalFontScale,
    savePortalFontScale,
} from "@/lib/portalTypography";

describe("sanitizePortalFontScale", () => {
    it("returns the default for garbage input", () => {
        expect(sanitizePortalFontScale(null)).toBe(DEFAULT_PORTAL_FONT_SCALE);
        expect(sanitizePortalFontScale("x")).toBe(DEFAULT_PORTAL_FONT_SCALE);
        expect(sanitizePortalFontScale(NaN)).toBe(DEFAULT_PORTAL_FONT_SCALE);
    });

    it("clamps to the min/max bounds", () => {
        expect(sanitizePortalFontScale(0.5)).toBe(PORTAL_FONT_SCALE_MIN);
        expect(sanitizePortalFontScale(2)).toBe(PORTAL_FONT_SCALE_MAX);
    });

    it("snaps to the nearest 5% step", () => {
        expect(sanitizePortalFontScale(1.02)).toBe(1);
        expect(sanitizePortalFontScale(1.08)).toBe(1.1);
    });

    it("absorbs floating point noise from repeated +5% steps", () => {
        // 0.9 + 0.05 vira 0.9500000000000001 em ponto flutuante
        expect(sanitizePortalFontScale(0.9 + 0.05)).toBe(0.95);
    });
});

describe("applyPortalFontScale", () => {
    afterEach(() => {
        document.body.innerHTML = "";
        document.documentElement.style.removeProperty("font-size");
        document.getElementById("t-ancestor-style")?.remove();
    });

    describe("elementos com font-size próprio (simulado via folha de estilo)", () => {
        // Folha de estilo, não `style=""` inline: a fase 1 de applyPortalFontScale
        // remove qualquer font-size inline antes de medir (é assim que ela reverte
        // a própria aplicação anterior) — um inline style simulando o "natural" no
        // teste seria apagado antes mesmo de ser lido. No app real, Tailwind nunca
        // aplica tamanho via inline style, só via classe/folha de estilo.
        beforeEach(() => {
            document.head.insertAdjacentHTML(
                "beforeend",
                '<style id="t-ancestor-style">#h { font-size: 30px; } #p { font-size: 14px; }</style>',
            );
            document.body.innerHTML = `
                <h1 id="h">Título</h1>
                <p id="p">Corpo</p>
            `;
        });

        it("scales body text by the full amount and headings by half", () => {
            applyPortalFontScale(1.3);

            const p = document.getElementById("p") as HTMLElement;
            const h1 = document.getElementById("h") as HTMLElement;
            expect(p.style.getPropertyValue("font-size")).toBe("18.2px"); // 14 * 1.3
            expect(h1.style.getPropertyValue("font-size")).toBe("34.5px"); // 30 * (1 + 0.3*0.5) = 30*1.15
        });

        it("does not touch container/layout properties — only font-size", () => {
            applyPortalFontScale(1.3);
            const p = document.getElementById("p") as HTMLElement;
            expect(p.style.padding).toBe("");
            expect(p.style.width).toBe("");
        });

        it("does not compound scale across repeated calls at different scales", () => {
            applyPortalFontScale(1.15);
            applyPortalFontScale(1.3);

            const p = document.getElementById("p") as HTMLElement;
            expect(p.style.getPropertyValue("font-size")).toBe("18.2px"); // 14 * 1.3, não 14 * 1.15 * 1.3
        });

        it("removes the inline override when scale returns to 1 (design exatamente como está)", () => {
            applyPortalFontScale(1.3);
            applyPortalFontScale(1);

            const p = document.getElementById("p") as HTMLElement;
            const h1 = document.getElementById("h") as HTMLElement;
            expect(p.style.getPropertyValue("font-size")).toBe("");
            expect(h1.style.getPropertyValue("font-size")).toBe("");
        });
    });

    it("never touches the root html font-size (tentamos escalar a raiz pros containers e revertemos — lido como zoom global)", () => {
        applyPortalFontScale(1.3);
        expect(document.documentElement.style.getPropertyValue("font-size")).toBe("");
    });

    // Nota sobre o bug real reportado (parágrafos de "subtítulo" sem classe de
    // tamanho própria — ex.: <p className="mt-6 max-w-md text-background/70">
    // — dentro de vários <div> de grid/layout que também herdam o tamanho):
    // o bug original lia+escrevia um elemento por vez, então um wrapper sem
    // estilo próprio podia medir o valor de um ancestral JÁ reescalado na
    // mesma passagem, compondo a escala a cada nível de aninhamento. A fase 2
    // (medir TODOS) só começa depois que a fase 1 (resetar TODOS) termina, e
    // a fase 3 (aplicar) só começa depois que a fase 2 termina — são três
    // laços sequenciais sobre o mesmo array, sem nenhum ponto de
    // interleaving possível (ver applyPortalFontScale acima). Não dá pra
    // testar automaticamente o cenário de herança em si: o jsdom deste
    // projeto não resolve font-size herdado via getComputedStyle para
    // elementos sem regra própria correspondente (só retorna valor pra quem
    // tem regra própria — confirmado à parte), e uma tentativa de testar a
    // ordem das chamadas via spy em CSSStyleDeclaration.setProperty deu falso
    // positivo: o próprio jsdom usa setProperty internamente pra construir o
    // objeto que getComputedStyle() retorna, indistinguível de uma escrita
    // real feita pelo nosso código.
});

describe("load/save round-trip", () => {
    beforeEach(() => {
        window.localStorage.clear();
        document.body.innerHTML = "";
    });

    it("loads the default when nothing is stored", () => {
        expect(loadPortalFontScale()).toBe(DEFAULT_PORTAL_FONT_SCALE);
    });

    it("persists and restores the scale", () => {
        savePortalFontScale(1.15);
        expect(loadPortalFontScale()).toBe(1.15);
    });

    it("recovers from corrupted storage", () => {
        window.localStorage.setItem(PORTAL_FONT_SCALE_STORAGE_KEY, "{not json");
        expect(loadPortalFontScale()).toBe(DEFAULT_PORTAL_FONT_SCALE);
    });
});
