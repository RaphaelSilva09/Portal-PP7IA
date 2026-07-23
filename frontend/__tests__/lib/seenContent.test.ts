import { beforeEach, describe, expect, it } from "vitest";

import {
    getSeenAt,
    hasUpdateSinceLastSeen,
    markSeen,
    SEEN_CONTENT_STORAGE_KEY,
} from "@/lib/seenContent";

describe("seenContent", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("returns null for never-seen content", () => {
        expect(getSeenAt("/view/newsletter/PPNEWS-001")).toBeNull();
    });

    it("records and retrieves a visit", () => {
        markSeen("/view/newsletter/PPNEWS-001");
        const seenAt = getSeenAt("/view/newsletter/PPNEWS-001");
        expect(seenAt).toBeInstanceOf(Date);
    });

    it("ignores non-path inputs", () => {
        markSeen("https://evil.example/x");
        expect(window.localStorage.getItem(SEEN_CONTENT_STORAGE_KEY)).toBeNull();
    });

    it("recovers from corrupted storage", () => {
        window.localStorage.setItem(SEEN_CONTENT_STORAGE_KEY, "{broken");
        expect(getSeenAt("/x")).toBeNull();
        markSeen("/x");
        expect(getSeenAt("/x")).toBeInstanceOf(Date);
    });

    describe("hasUpdateSinceLastSeen", () => {
        it("is false when content was never seen", () => {
            expect(hasUpdateSinceLastSeen("/view/estudar/e-01", new Date())).toBe(false);
        });

        it("is false without href or updatedAt", () => {
            expect(hasUpdateSinceLastSeen(null, new Date())).toBe(false);
            expect(hasUpdateSinceLastSeen("/x", null)).toBe(false);
            expect(hasUpdateSinceLastSeen("/x", undefined)).toBe(false);
        });

        it("is true when updated after the last visit", () => {
            markSeen("/view/estudar/e-01");
            const future = new Date(Date.now() + 60_000);
            expect(hasUpdateSinceLastSeen("/view/estudar/e-01", future)).toBe(true);
        });

        it("is false when updated before the last visit", () => {
            markSeen("/view/estudar/e-01");
            const past = new Date(Date.now() - 60_000);
            expect(hasUpdateSinceLastSeen("/view/estudar/e-01", past)).toBe(false);
        });
    });
});
