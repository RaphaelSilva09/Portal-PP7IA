import type { ReadingTrailDetail, ReadingTrailStep } from "@/domain/entities/ReadingTrail";
import { isSavableContentType } from "@/domain/entities/SavedContent";
import type { IReadingTrailRepository } from "@/domain/repositories/IReadingTrailRepository";
import { itemKey } from "@/domain/repositories/IReadingTrailRepository";
import type { IContentRepository } from "@/domain/repositories/IContentRepository";

type TrailRepoDeps = Pick<IReadingTrailRepository, "getBySlug" | "getCompletedKeys">;
type ContentRepoDeps = Pick<IContentRepository, "getById">;

export class GetReadingTrailUseCase {
    constructor(
        private trailRepo: TrailRepoDeps,
        private contentRepo: ContentRepoDeps,
    ) {}

    /** Monta a trilha publicada com os passos hidratados (título/link) e o progresso do leitor, se logado. */
    async execute(slug: string, userId: string | null): Promise<ReadingTrailDetail | null> {
        const trail = await this.trailRepo.getBySlug(slug);
        if (!trail || !trail.published) return null;

        const completedKeys = userId
            ? await this.trailRepo.getCompletedKeys(userId, trail.id)
            : new Set<string>();

        const orderedItems = [...trail.items].sort((a, b) => a.position - b.position);

        const steps = await Promise.all(orderedItems.map(async (item): Promise<ReadingTrailStep | null> => {
            if (!isSavableContentType(item.contentType)) return null;
            const numericId = Number(item.contentId);
            if (!Number.isInteger(numericId)) return null;

            const content = await this.contentRepo.getById(item.contentType, numericId).catch(() => null);
            if (!content) return null;

            return {
                contentType: item.contentType,
                contentId: item.contentId,
                position: item.position,
                title: content.title,
                href: `/view/${item.contentType}/${item.contentId}`,
                completed: completedKeys.has(itemKey(item)),
            };
        }));

        return {
            slug: trail.slug,
            title: trail.title,
            description: trail.description,
            coverImagePath: trail.coverImagePath,
            steps: steps.filter((s): s is ReadingTrailStep => s !== null),
        };
    }
}
