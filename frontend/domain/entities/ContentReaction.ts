/** ContentReaction (Domain Layer) — reação rápida pós-leitura por conteúdo (PDF 6.4). */

export const REACTION_TYPES = ["fez_pensar", "apliquei", "quero_mais", "nao_esperava"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export const REACTION_LABEL: Record<ReactionType, string> = {
    fez_pensar: "Fez pensar",
    apliquei: "Apliquei isso",
    quero_mais: "Quero mais deste tema",
    nao_esperava: "Não era o que esperava",
};

export type ReactionCounts = Record<ReactionType, number>;

export function emptyReactionCounts(): ReactionCounts {
    return { fez_pensar: 0, apliquei: 0, quero_mais: 0, nao_esperava: 0 };
}
