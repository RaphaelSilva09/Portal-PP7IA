import type { ReadingTrailItemRef, ReadingTrailRecord, ReadingTrailSummary } from "../entities/ReadingTrail";

export interface ReadingTrailItemInput {
    contentType: string;
    contentId: string;
}

export interface CreateReadingTrailInput {
    slug: string;
    title: string;
    description?: string;
    coverImagePath?: string | null;
    published?: boolean;
    items: ReadingTrailItemInput[];
}

export interface UpdateReadingTrailInput {
    slug?: string;
    title?: string;
    description?: string;
    coverImagePath?: string | null;
    published?: boolean;
    /** Quando presente, substitui a lista de itens por inteiro (posição = índice no array). */
    items?: ReadingTrailItemInput[];
}

export interface IReadingTrailRepository {
    // Admin
    getAllForAdmin(): Promise<ReadingTrailRecord[]>;
    getByIdForAdmin(id: number): Promise<ReadingTrailRecord | null>;
    create(input: CreateReadingTrailInput): Promise<ReadingTrailRecord>;
    update(id: number, input: UpdateReadingTrailInput): Promise<ReadingTrailRecord | null>;
    delete(id: number): Promise<boolean>;

    // Público
    getPublishedSummaries(): Promise<ReadingTrailSummary[]>;
    getBySlug(slug: string): Promise<ReadingTrailRecord | null>;

    // Progresso
    /** Chaves "contentType|contentId" que o usuário já concluiu nesta trilha. */
    getCompletedKeys(userId: string, trailId: number): Promise<Set<string>>;
    /** Marca este conteúdo como concluído em toda trilha que o contenha (normalmente 0 ou 1). */
    markProgress(userId: string, contentType: string, contentId: string): Promise<void>;
}

export function itemKey(ref: Pick<ReadingTrailItemRef, "contentType" | "contentId">): string {
    return `${ref.contentType}|${ref.contentId}`;
}
