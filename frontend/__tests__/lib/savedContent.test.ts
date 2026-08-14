import { describe, expect, it } from "vitest";
import { hydrateSavedContent } from "@/lib/savedContent";
import type { HydratableContentItem } from "@/lib/savedContent";
import type { SavedContentEntry } from "@/domain/entities/SavedContent";

function entry(contentType: string, contentId: string, createdAt = new Date("2026-08-11")): SavedContentEntry {
    return { contentType, contentId, createdAt };
}

function contentItem(overrides: Partial<HydratableContentItem> = {}): HydratableContentItem {
    return {
        id: 1,
        title: "Título",
        formattedDate: "11/08/2026",
        formattedNumber: "001",
        htmlAvailable: true,
        pdfAvailable: false,
        readTime: 5,
        ...overrides,
    };
}

describe("hydrateSavedContent", () => {
    it("hydrates entries with the full card data and a /view href, preserving order", async () => {
        const entries = [entry("newsletter", "10"), entry("mini-livro", "3")];
        const result = await hydrateSavedContent(entries, async (type, id) =>
            contentItem({ id: Number(id), title: `${type}-${id}` }));

        expect(result).toEqual([
            {
                contentType: "newsletter", contentId: "10", title: "newsletter-10", href: "/view/newsletter/10", createdAt: entries[0].createdAt,
                id: 10, formattedDate: "11/08/2026", formattedNumber: "001", htmlAvailable: true, pdfAvailable: false, readTime: 5,
            },
            {
                contentType: "mini-livro", contentId: "3", title: "mini-livro-3", href: "/view/mini-livro/3", createdAt: entries[1].createdAt,
                id: 3, formattedDate: "11/08/2026", formattedNumber: "001", htmlAvailable: true, pdfAvailable: false, readTime: 5,
            },
        ]);
    });

    it("silently drops entries whose content no longer exists", async () => {
        const entries = [entry("newsletter", "10"), entry("mini-livro", "999")];
        const result = await hydrateSavedContent(entries, async (type, id) =>
            id === "999" ? null : contentItem({ title: `${type}-${id}` }));

        expect(result).toHaveLength(1);
        expect(result[0].contentId).toBe("10");
    });

    it("drops entries whose lookup throws instead of failing the whole list", async () => {
        const entries = [entry("newsletter", "10"), entry("mini-livro", "3")];
        const result = await hydrateSavedContent(entries, async (type, id) => {
            if (id === "3") throw new Error("db down");
            return contentItem({ title: `${type}-${id}` });
        });

        expect(result).toHaveLength(1);
        expect(result[0].contentId).toBe("10");
    });

    it("returns an empty list for no entries", async () => {
        const result = await hydrateSavedContent([], async () => contentItem());
        expect(result).toEqual([]);
    });
});
