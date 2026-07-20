import { beforeEach, describe, expect, it } from "vitest";

import {
    BOOK_CONTENT_TYPES,
    BOOK_PROGRESS_STORAGE_KEY,
    loadBookProgress,
    saveBookProgress,
} from "@/lib/bookProgress";

describe("bookProgress", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("returns null when nothing saved", () => {
        expect(loadBookProgress()).toBeNull();
    });

    it("saves and restores the last accessed chapter", () => {
        saveBookProgress({ href: "/view/mini-livro-section/12", title: "ML-05 · Delegar", type: "mini-livro-section" });

        const progress = loadBookProgress();
        expect(progress?.href).toBe("/view/mini-livro-section/12");
        expect(progress?.title).toBe("ML-05 · Delegar");
        expect(progress?.type).toBe("mini-livro-section");
        expect(progress?.savedAt).toBeTruthy();
    });

    it("overwrites previous progress with the newest visit", () => {
        saveBookProgress({ href: "/view/book/1", title: "Livro", type: "book" });
        saveBookProgress({ href: "/view/mini-livro/7", title: "ML-07", type: "mini-livro" });

        expect(loadBookProgress()?.href).toBe("/view/mini-livro/7");
    });

    it("rejects external or malformed hrefs", () => {
        saveBookProgress({ href: "https://evil.example/x", title: "x", type: "book" });
        expect(loadBookProgress()).toBeNull();
    });

    it("returns null for corrupted storage", () => {
        window.localStorage.setItem(BOOK_PROGRESS_STORAGE_KEY, "{broken");
        expect(loadBookProgress()).toBeNull();

        window.localStorage.setItem(BOOK_PROGRESS_STORAGE_KEY, JSON.stringify({ href: "no-slash" }));
        expect(loadBookProgress()).toBeNull();
    });

    it("covers the book universe content types", () => {
        expect(BOOK_CONTENT_TYPES.has("book")).toBe(true);
        expect(BOOK_CONTENT_TYPES.has("mini-livro")).toBe(true);
        expect(BOOK_CONTENT_TYPES.has("ebook")).toBe(true);
        expect(BOOK_CONTENT_TYPES.has("mini-livro-section")).toBe(true);
        expect(BOOK_CONTENT_TYPES.has("newsletter")).toBe(false);
    });
});
