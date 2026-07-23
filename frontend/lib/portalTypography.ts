/**
 * Controle de tipografia do portal (chrome — header, dropdowns, home, cards,
 * footer), distinto do controle de leitura de artigos (`readingPrefs.ts`,
 * escopado ao iframe de conteúdo). Persistido em localStorage.
 *
 * Reescreve o `font-size` computado de cada elemento (mesmo princípio de
 * `applyFontScaleToDocument`, usado para o conteúdo de artigos) em vez de
 * escalar a raiz via `html { font-size: % }`. Já tentamos escalar a raiz
 * (mesmo amortecida, a uma taxa menor que a do texto) pra dar mais espaço
 * pros containers — não funciona: a escala de espaçamento do Tailwind
 * (padding, gap, `max-w-*`, `rounded-*`, ícones etc.) é toda em `rem`,
 * relativa à raiz, e cresce em peso em TUDO no site, não só nos containers
 * que precisavam de mais espaço — lido como zoom da página inteira de novo,
 * só que numa magnitude menor. Reescrever só o font-size, por elemento,
 * mantém containers/paddings fixos; onde algum container específico precisa
 * mesmo de mais espaço em telas maiores (ex.: o dropdown do perfil), a
 * solução é um ajuste estático de layout naquele componente, não uma escala
 * dinâmica global.
 *
 * Títulos (h1–h6) crescem numa proporção menor que o corpo do texto.
 */

export const PORTAL_FONT_SCALE_MIN = 0.85;
export const PORTAL_FONT_SCALE_MAX = 1.5;
export const PORTAL_FONT_SCALE_STEP = 0.05;
export const DEFAULT_PORTAL_FONT_SCALE = 1;

export const PORTAL_FONT_SCALE_STORAGE_KEY = "pp7ias.portal-font-scale";
export const PORTAL_FONT_SCALE_EVENT = "pp7ias:portal-font-scale-changed";

/** Títulos crescem à metade da taxa do corpo (ex.: corpo +30% → título +15%). */
const HEADING_DAMPENING = 0.5;
const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

export function sanitizePortalFontScale(raw: unknown): number {
    const n = typeof raw === "number" ? raw : NaN;
    if (!Number.isFinite(n)) return DEFAULT_PORTAL_FONT_SCALE;
    const stepped = round2(Math.round(n / PORTAL_FONT_SCALE_STEP) * PORTAL_FONT_SCALE_STEP);
    return Math.min(PORTAL_FONT_SCALE_MAX, Math.max(PORTAL_FONT_SCALE_MIN, stepped));
}

export function loadPortalFontScale(): number {
    if (typeof window === "undefined") return DEFAULT_PORTAL_FONT_SCALE;
    try {
        const stored = window.localStorage.getItem(PORTAL_FONT_SCALE_STORAGE_KEY);
        if (!stored) return DEFAULT_PORTAL_FONT_SCALE;
        return sanitizePortalFontScale(JSON.parse(stored));
    } catch {
        return DEFAULT_PORTAL_FONT_SCALE;
    }
}

/**
 * Reescreve o font-size computado de cada elemento do body, em 3 fases
 * sempre completas (nunca intercaladas):
 *
 *   1. Remove qualquer font-size que nós mesmos tenhamos definido numa
 *      aplicação anterior, revelando de novo o valor real da cascata
 *      Tailwind (rem/px original).
 *   2. Mede o valor "limpo" (getComputedStyle) de TODOS os elementos.
 *   3. Aplica a escala em cima do valor medido na fase 2.
 *
 * Por que 3 fases e não uma leitura+escrita por elemento, cacheada num
 * atributo: muitos elementos de layout (divs de grid/wrapper, parágrafos de
 * subtítulo sem classe de tamanho própria) não têm font-size explícito —
 * herdam do ancestral. Se a leitura de um elemento acontecesse depois da
 * escrita de um ancestral seu NA MESMA passagem, esse elemento sem estilo
 * próprio mediria o valor do ancestral JÁ reescalado, e não o original —
 * compondo a escala a cada nível de aninhamento (bug real: parágrafos de
 * "subtítulo" dentro de vários `<div>` de grid sem classe de tamanho
 * ficavam minúsculos ou gigantes dependendo da direção). Separar leitura de
 * escrita por completo elimina isso, custe o que custar em re-leitura.
 */
export function applyPortalFontScale(scale: number): void {
    if (typeof document === "undefined") return;
    const body = document.body;
    if (!body) return;

    const elements = [body, ...Array.from(body.querySelectorAll("*"))]
        .filter((el): el is HTMLElement => el instanceof HTMLElement);

    for (const el of elements) {
        el.style.removeProperty("font-size");
    }

    const naturalByElement = new Map<HTMLElement, number>();
    for (const el of elements) {
        const computed = parseFloat(getComputedStyle(el).fontSize);
        if (Number.isFinite(computed) && computed > 0) {
            naturalByElement.set(el, computed);
        }
    }

    for (const el of elements) {
        const naturalPx = naturalByElement.get(el);
        if (naturalPx === undefined) continue;

        const elementScale = HEADING_TAGS.has(el.tagName)
            ? 1 + (scale - 1) * HEADING_DAMPENING
            : scale;

        if (elementScale !== 1) {
            el.style.setProperty("font-size", `${round2(naturalPx * elementScale)}px`);
        }
    }
}

export function savePortalFontScale(scale: number): void {
    applyPortalFontScale(scale);
    try {
        window.localStorage.setItem(PORTAL_FONT_SCALE_STORAGE_KEY, JSON.stringify(scale));
        window.dispatchEvent(new CustomEvent(PORTAL_FONT_SCALE_EVENT, { detail: scale }));
    } catch {
        // storage indisponível (modo privado etc.) — preferência vale só para a sessão via evento
        window.dispatchEvent(new CustomEvent(PORTAL_FONT_SCALE_EVENT, { detail: scale }));
    }
}
