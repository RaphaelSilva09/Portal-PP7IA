export interface SiteBg {
    // Fundo do site
    light: string;
    dark: string;

    // Card do Livro
    bookCardBg: string;
    bookCardTitleColor: string;
    bookCardLabelColor: string;    // eyebrow "O Livro ·" + contagem de capítulos
    bookCardSubtitleColor: string; // subtítulo (itálico)
    bookCardCtaColor: string;          // "Ler →"
    bookCardProgressBgColor: string;   // trilho da barra de progresso
    bookCardProgressFillColor: string; // preenchimento da barra de progresso

    // Card de Newsletter — sidebar
    newsletterCardBg: string;
    newsletterSidebarNumberColor: string; // número grande
    newsletterSidebarLabelColor: string;  // "leituras hoje"

    // Total de capítulos planejados
    bookChaptersTotal: number;
}

export const DEFAULT_SITE_BG: SiteBg = {
    light: "#eef4ff",
    dark: "#111111",

    bookCardBg: "#1a2f20",
    bookCardTitleColor: "#ffffff",
    bookCardLabelColor: "#8a9e93",
    bookCardSubtitleColor: "#96b0a0",
    bookCardCtaColor: "#9dbcac",
    bookCardProgressBgColor: "#3a5a47",
    bookCardProgressFillColor: "#6fa88a",

    newsletterCardBg: "#6366f1",
    newsletterSidebarNumberColor: "#ffffff",
    newsletterSidebarLabelColor: "#cfd0fc",

    bookChaptersTotal: 21,
};

export function isValidBgHex(v: string): boolean {
    return /^#[0-9a-f]{6}$/i.test(v);
}

function hexOrDefault(value: string | undefined, fallback: string): string {
    return isValidBgHex(value ?? "") ? value! : fallback;
}

export function mergeSiteBgWithDefaults(partial: Partial<SiteBg>): SiteBg {
    const d = DEFAULT_SITE_BG;
    return {
        light: hexOrDefault(partial.light, d.light),
        dark:  hexOrDefault(partial.dark,  d.dark),

        bookCardBg:           hexOrDefault(partial.bookCardBg,           d.bookCardBg),
        bookCardTitleColor:   hexOrDefault(partial.bookCardTitleColor,   d.bookCardTitleColor),
        bookCardLabelColor:   hexOrDefault(partial.bookCardLabelColor,   d.bookCardLabelColor),
        bookCardSubtitleColor: hexOrDefault(partial.bookCardSubtitleColor, d.bookCardSubtitleColor),
        bookCardCtaColor:          hexOrDefault(partial.bookCardCtaColor,          d.bookCardCtaColor),
        bookCardProgressBgColor:   hexOrDefault(partial.bookCardProgressBgColor,   d.bookCardProgressBgColor),
        bookCardProgressFillColor: hexOrDefault(partial.bookCardProgressFillColor, d.bookCardProgressFillColor),

        newsletterCardBg:              hexOrDefault(partial.newsletterCardBg,              d.newsletterCardBg),
        newsletterSidebarNumberColor:  hexOrDefault(partial.newsletterSidebarNumberColor,  d.newsletterSidebarNumberColor),
        newsletterSidebarLabelColor:   hexOrDefault(partial.newsletterSidebarLabelColor,   d.newsletterSidebarLabelColor),

        bookChaptersTotal: (typeof partial.bookChaptersTotal === "number" && partial.bookChaptersTotal > 0)
            ? Math.round(partial.bookChaptersTotal)
            : d.bookChaptersTotal,
    };
}
