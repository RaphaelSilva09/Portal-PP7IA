export type BlockId =
    | "newsletter"
    | "reportagem"
    | "radar"
    | "livro"
    | "biblioteca"
    | "estudar"
    | "ensinar";

export const BLOCK_IDS: BlockId[] = [
    "newsletter",
    "reportagem",
    "radar",
    "livro",
    "biblioteca",
    "estudar",
    "ensinar",
];

export const BLOCK_LABELS: Record<BlockId, string> = {
    newsletter: "Newsletter",
    reportagem: "Reportagem da Semana",
    radar: "Radar",
    livro: "Enquanto é Tempo",
    biblioteca: "Biblioteca",
    estudar: "Estudar",
    ensinar: "Ensinar",
};

export const BLOCK_NUMBERS: Record<BlockId, string> = {
    newsletter: "01",
    reportagem: "02",
    radar:      "03",
    livro:      "04",
    biblioteca: "05",
    estudar:    "06",
    ensinar:    "07",
};

/** Defaults match globals.css light-mode values */
export const DEFAULT_BLOCK_COLORS: Record<BlockId, string> = {
    newsletter: "#3b82f6",
    reportagem: "#f97316",
    radar:      "#06b6d4",
    livro:      "#f59e0b",
    biblioteca: "#14b8a6",
    estudar:    "#6366f1",
    ensinar:    "#ec4899",
};

export type BlockColors = Record<BlockId, string>;

export function mergeWithDefaults(partial: Partial<BlockColors>): BlockColors {
    const result = { ...DEFAULT_BLOCK_COLORS };
    for (const id of BLOCK_IDS) {
        const v = partial[id];
        if (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v)) {
            result[id] = v;
        }
    }
    return result;
}
