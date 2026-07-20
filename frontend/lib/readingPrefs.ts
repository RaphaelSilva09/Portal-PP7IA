/**
 * Preferências de tipografia do leitor (PDF 5.2).
 *
 * Persistidas em localStorage nesta v1 — a migração para o perfil do usuário
 * (banco) está planejada como v2; este módulo isola o storage para facilitar a troca.
 * O CSS gerado é injetado no documento do iframe de leitura (same-origin).
 */

export const FONT_SCALE_STEPS = [0.85, 1, 1.15, 1.3] as const;
export const LINE_HEIGHT_STEPS = [null, 1.7, 1.9] as const;

export type FontScale = (typeof FONT_SCALE_STEPS)[number];
export type LineHeight = (typeof LINE_HEIGHT_STEPS)[number];
export type FontWeight = "regular" | "medium";

export interface ReadingPrefs {
    fontScale: FontScale;
    weight: FontWeight;
    lineHeight: LineHeight;
}

export const DEFAULT_READING_PREFS: ReadingPrefs = {
    fontScale: 1,
    weight: "regular",
    lineHeight: null,
};

export const READING_PREFS_STORAGE_KEY = "pp7ias.reading-prefs";
export const READING_PREFS_EVENT = "pp7ias:reading-prefs-changed";

export function sanitizeReadingPrefs(raw: unknown): ReadingPrefs {
    if (typeof raw !== "object" || raw === null) return { ...DEFAULT_READING_PREFS };
    const candidate = raw as Partial<Record<keyof ReadingPrefs, unknown>>;

    const fontScale = FONT_SCALE_STEPS.includes(candidate.fontScale as FontScale)
        ? (candidate.fontScale as FontScale)
        : DEFAULT_READING_PREFS.fontScale;
    const weight = candidate.weight === "medium" ? "medium" : "regular";
    const lineHeight = LINE_HEIGHT_STEPS.includes(candidate.lineHeight as LineHeight)
        ? (candidate.lineHeight as LineHeight)
        : DEFAULT_READING_PREFS.lineHeight;

    return { fontScale, weight, lineHeight };
}

export function loadReadingPrefs(): ReadingPrefs {
    if (typeof window === "undefined") return { ...DEFAULT_READING_PREFS };
    try {
        const stored = window.localStorage.getItem(READING_PREFS_STORAGE_KEY);
        if (!stored) return { ...DEFAULT_READING_PREFS };
        return sanitizeReadingPrefs(JSON.parse(stored));
    } catch {
        return { ...DEFAULT_READING_PREFS };
    }
}

export function saveReadingPrefs(prefs: ReadingPrefs): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(READING_PREFS_STORAGE_KEY, JSON.stringify(prefs));
        window.dispatchEvent(new CustomEvent(READING_PREFS_EVENT, { detail: prefs }));
    } catch {
        // storage indisponível (modo privado etc.) — preferência vale só para a sessão via evento
        window.dispatchEvent(new CustomEvent(READING_PREFS_EVENT, { detail: prefs }));
    }
}

/**
 * Gera o CSS a injetar no iframe. Retorna string vazia quando tudo está no
 * padrão — nesse caso o documento mantém a tipografia original.
 * O ajuste de fontScale em si não é feito aqui: conteúdos reais fixam
 * font-size em px (direto ou via custom properties), que não escala com
 * `html { font-size: % }`. Ver applyFontScaleToDocument().
 */
export function buildReadingPrefsCss(prefs: ReadingPrefs): string {
    const rules: string[] = [];

    if (prefs.fontScale !== 1) {
        rules.push(`html { font-size: ${Math.round(prefs.fontScale * 100)}% !important; }`);
    }
    if (prefs.lineHeight !== null) {
        rules.push(`body, body :is(p, li, blockquote) { line-height: ${prefs.lineHeight} !important; }`);
    }
    if (prefs.weight === "medium") {
        rules.push("body :is(p, li, blockquote, span, a, em) { font-weight: 500 !important; }");
    }

    return rules.join("\n");
}

const NATURAL_FONT_SIZE_ATTR = "data-pp7ias-natural-font-size";

/**
 * Reescreve o font-size computado de cada elemento do documento, em vez de
 * confiar em `html { font-size: % }` cascateando via rem/em. Conteúdos reais
 * fixam tamanho em px (às vezes via custom properties CSS), que ignora a
 * escala do root — getComputedStyle já resolve isso para um px absoluto,
 * então a escala funciona não importa qual mecanismo o CSS do conteúdo use.
 *
 * O valor "natural" (escala 100%) de cada elemento é cacheado num atributo
 * na primeira passagem, para não compor escala sobre escala em cliques
 * sucessivos (senão 115% de 115% viraria ~132%, e assim por diante).
 */
function isStyleable(element: Element): element is Element & ElementCSSInlineStyle {
    // Não usar `instanceof HTMLElement` aqui: os elementos pertencem ao
    // realm do documento do iframe, cujo HTMLElement é um construtor
    // diferente do HTMLElement global desta janela (multi-realm) — o
    // `instanceof` cross-realm sempre retorna false e pularia tudo.
    return "style" in element;
}

export function applyFontScaleToDocument(doc: Document, scale: number): void {
    const body = doc.body;
    if (!body) return;

    const view = doc.defaultView;
    if (!view) return;

    const elements: Element[] = [body, ...Array.from(body.querySelectorAll("*"))];

    for (const element of elements) {
        if (!isStyleable(element)) continue;

        let natural = element.getAttribute(NATURAL_FONT_SIZE_ATTR);
        if (natural === null) {
            const computed = parseFloat(view.getComputedStyle(element).fontSize);
            if (!Number.isFinite(computed) || computed <= 0) continue;
            natural = String(computed);
            element.setAttribute(NATURAL_FONT_SIZE_ATTR, natural);
        }

        const naturalPx = parseFloat(natural);
        if (!Number.isFinite(naturalPx) || naturalPx <= 0) continue;

        if (scale === 1) {
            element.style.removeProperty("font-size");
        } else {
            element.style.setProperty("font-size", `${naturalPx * scale}px`, "important");
        }
    }
}
