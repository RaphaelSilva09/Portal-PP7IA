import type { BlockId } from "@/domain/entities/BlockColors";

export const PUBLIC_BLOCK_LABELS: Record<BlockId, string> = {
    newsletter: "Newsletter",
    reportagem: "Inteligência Artificial",
    radar: "Editoriais e Artigos",
    livro: "Enquanto é Tempo",
    biblioteca: "Biblioteca",
    estudar: "Estudar",
    ensinar: "Ensinar",
};

const PUBLIC_TO_INTERNAL: Record<string, BlockId> = {
    newsletter: "newsletter",
    "inteligencia-artificial": "reportagem",
    reportagem: "reportagem",
    "editoriais-artigos": "radar",
    radar: "radar",
    livro: "livro",
    "mini-livros": "livro",
    biblioteca: "biblioteca",
    estudar: "estudar",
    ensinar: "ensinar",
};

const INTERNAL_TO_PUBLIC: Record<BlockId, string> = {
    newsletter: "newsletter",
    reportagem: "inteligencia-artificial",
    radar: "editoriais-artigos",
    livro: "livro",
    biblioteca: "biblioteca",
    estudar: "estudar",
    ensinar: "ensinar",
};

export function normalizeExplorarBlock(input: string | null | undefined): BlockId | null {
    if (!input) return null;
    return PUBLIC_TO_INTERNAL[input] ?? null;
}

export function publicExplorarBlockSlug(block: BlockId | null): string | null {
    if (!block) return null;
    return INTERNAL_TO_PUBLIC[block] ?? null;
}
