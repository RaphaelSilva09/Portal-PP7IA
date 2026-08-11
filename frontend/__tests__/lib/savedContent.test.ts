import { describe, expect, it } from "vitest";
import { hydrateSavedContent } from "@/lib/savedContent";
import type { SavedContentEntry } from "@/domain/entities/SavedContent";

function entry(contentType: string, contentId: string, createdAt = new Date("2026-08-11")): SavedContentEntry {
    return { contentType, contentId, createdAt };
}

describe("hydrateSavedContent", () => {
    it("hydrates entries with title and a /view href, preserving order", async () => {
        const entries = [entry("newsletter", "10"), entry("mini-livro", "3")];
        const result = await hydrateSavedContent(entries, async (type, id) => ({ title: `${type}-${id}` }));

        expect(result).toEqual([
            { contentType: "newsletter", contentId: "10", title: "newsletter-10", href: "/view/newsletter/10", createdAt: entries[0].createdAt },
            { contentType: "mini-livro", contentId: "3", title: "mini-livro-3", href: "/view/mini-livro/3", createdAt: entries[1].createdAt },
        ]);
    });

    it("silently drops entries whose content no longer exists", async () => {
        const entries = [entry("newsletter", "10"), entry("mini-livro", "999")];
        const result = await hydrateSavedContent(entries, async (type, id) =>
            id === "999" ? null : { title: `${type}-${id}` });

        expect(result).toHaveLength(1);
        expect(result[0].contentId).toBe("10");
    });

    it("drops entries whose lookup throws instead of failing the whole list", async () => {
        const entries = [entry("newsletter", "10"), entry("mini-livro", "3")];
        const result = await hydrateSavedContent(entries, async (type, id) => {
            if (id === "3") throw new Error("db down");
            return { title: `${type}-${id}` };
        });

        expect(result).toHaveLength(1);
        expect(result[0].contentId).toBe("10");
    });

    it("returns an empty list for no entries", async () => {
        const result = await hydrateSavedContent([], async () => ({ title: "x" }));
        expect(result).toEqual([]);
    });
});
