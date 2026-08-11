import { describe, expect, it, vi } from "vitest";
import { GetReadingTrailUseCase } from "@/application/usecases/GetReadingTrailUseCase";
import type { ReadingTrailRecord } from "@/domain/entities/ReadingTrail";
import type { IReadingTrailRepository } from "@/domain/repositories/IReadingTrailRepository";
import type { IContentRepository } from "@/domain/repositories/IContentRepository";

function trail(overrides: Partial<ReadingTrailRecord> = {}): ReadingTrailRecord {
    return {
        id: 1,
        slug: "entenda-ia",
        title: "Entenda IA em 3 leituras",
        description: "Roteiro introdutório.",
        coverImagePath: null,
        published: true,
        items: [
            { contentType: "newsletter", contentId: "10", position: 0 },
            { contentType: "mini-livro", contentId: "3", position: 1 },
        ],
        createdAt: new Date("2026-08-01"),
        updatedAt: new Date("2026-08-01"),
        ...overrides,
    };
}

function contentItem(title: string) {
    return { title } as { title: string };
}

describe("GetReadingTrailUseCase", () => {
    it("returns null when the trail does not exist", async () => {
        const trailRepo = { getBySlug: vi.fn().mockResolvedValue(null), getCompletedKeys: vi.fn() } satisfies Partial<IReadingTrailRepository>;
        const contentRepo = { getById: vi.fn() } satisfies Partial<IContentRepository>;
        const useCase = new GetReadingTrailUseCase(trailRepo as unknown as IReadingTrailRepository, contentRepo as unknown as IContentRepository);

        expect(await useCase.execute("missing", null)).toBeNull();
    });

    it("returns null when the trail is not published", async () => {
        const trailRepo = {
            getBySlug: vi.fn().mockResolvedValue(trail({ published: false })),
            getCompletedKeys: vi.fn(),
        } satisfies Partial<IReadingTrailRepository>;
        const contentRepo = { getById: vi.fn() } satisfies Partial<IContentRepository>;
        const useCase = new GetReadingTrailUseCase(trailRepo as unknown as IReadingTrailRepository, contentRepo as unknown as IContentRepository);

        expect(await useCase.execute("entenda-ia", null)).toBeNull();
    });

    it("hydrates steps in position order with title/href and no progress for an anonymous reader", async () => {
        const trailRepo = {
            getBySlug: vi.fn().mockResolvedValue(trail()),
            getCompletedKeys: vi.fn(),
        } satisfies Partial<IReadingTrailRepository>;
        const contentRepo = {
            getById: vi.fn()
                .mockResolvedValueOnce(contentItem("Newsletter 10"))
                .mockResolvedValueOnce(contentItem("Mini-Livro 3")),
        } satisfies Partial<IContentRepository>;
        const useCase = new GetReadingTrailUseCase(trailRepo as unknown as IReadingTrailRepository, contentRepo as unknown as IContentRepository);

        const result = await useCase.execute("entenda-ia", null);

        expect(trailRepo.getCompletedKeys).not.toHaveBeenCalled();
        expect(result?.steps).toEqual([
            { contentType: "newsletter", contentId: "10", position: 0, title: "Newsletter 10", href: "/view/newsletter/10", completed: false },
            { contentType: "mini-livro", contentId: "3", position: 1, title: "Mini-Livro 3", href: "/view/mini-livro/3", completed: false },
        ]);
    });

    it("marks steps completed based on the logged-in reader's progress", async () => {
        const trailRepo = {
            getBySlug: vi.fn().mockResolvedValue(trail()),
            getCompletedKeys: vi.fn().mockResolvedValue(new Set(["newsletter|10"])),
        } satisfies Partial<IReadingTrailRepository>;
        const contentRepo = {
            getById: vi.fn()
                .mockResolvedValueOnce(contentItem("Newsletter 10"))
                .mockResolvedValueOnce(contentItem("Mini-Livro 3")),
        } satisfies Partial<IContentRepository>;
        const useCase = new GetReadingTrailUseCase(trailRepo as unknown as IReadingTrailRepository, contentRepo as unknown as IContentRepository);

        const result = await useCase.execute("entenda-ia", "user-1");

        expect(trailRepo.getCompletedKeys).toHaveBeenCalledWith("user-1", 1);
        expect(result?.steps.map(s => s.completed)).toEqual([true, false]);
    });

    it("drops a step whose underlying content was removed", async () => {
        const trailRepo = {
            getBySlug: vi.fn().mockResolvedValue(trail()),
            getCompletedKeys: vi.fn().mockResolvedValue(new Set()),
        } satisfies Partial<IReadingTrailRepository>;
        const contentRepo = {
            getById: vi.fn()
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(contentItem("Mini-Livro 3")),
        } satisfies Partial<IContentRepository>;
        const useCase = new GetReadingTrailUseCase(trailRepo as unknown as IReadingTrailRepository, contentRepo as unknown as IContentRepository);

        const result = await useCase.execute("entenda-ia", "user-1");

        expect(result?.steps).toHaveLength(1);
        expect(result?.steps[0].contentId).toBe("3");
    });
});
