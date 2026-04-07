export const MINI_LIVRO_PARTS = [
    { order: 1, fallbackTitle: "Liderança Híbrida", labelPrefix: "Parte I" },
    { order: 2, fallbackTitle: "A Coragem de Executar", labelPrefix: "Parte II" },
    { order: 3, fallbackTitle: "O Que Fica", labelPrefix: "Parte III" },
] as const;

export type MiniLivroPart = (typeof MINI_LIVRO_PARTS)[number];

export function getMiniLivroPartLabel(part: MiniLivroPart, ebook?: { title: string } | null): string {
    return `${part.labelPrefix} — ${ebook?.title?.trim() || part.fallbackTitle}`;
}
