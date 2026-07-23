import { ReactionCounts, ReactionType } from "../entities/ContentReaction";

export interface TopReactedContent {
    contentType: string;
    contentId: string;
    counts: ReactionCounts;
    total: number;
}

export interface IContentReactionRepository {
    /** Alterna a reação do usuário: mesma reação de novo remove; reação diferente substitui. */
    toggle(userId: string, contentType: string, contentId: string, reaction: ReactionType): Promise<ReactionType | null>;
    getCounts(contentType: string, contentId: string): Promise<ReactionCounts>;
    getUserReaction(userId: string, contentType: string, contentId: string): Promise<ReactionType | null>;
    getTopReacted(limit: number): Promise<TopReactedContent[]>;
}
