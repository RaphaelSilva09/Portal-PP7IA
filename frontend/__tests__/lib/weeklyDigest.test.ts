import { describe, expect, it } from "vitest";

import { buildWeeklyDigest, filterLastDays, type DigestItem } from "@/lib/email/weeklyDigest";

const NOW = new Date("2026-07-08T19:00:00-03:00");
const BASE_URL = "https://portal.example.com";

function item(overrides: Partial<DigestItem> = {}): DigestItem {
    return {
        section: "Newsletter",
        title: "Edição 42",
        url: "/view/newsletter/PPNEWS-042",
        createdAt: new Date("2026-07-06T10:00:00-03:00"),
        ...overrides,
    };
}

describe("filterLastDays", () => {
    it("keeps only items within the window", () => {
        const items = [
            item(),
            item({ title: "velho", createdAt: new Date("2026-06-20T10:00:00-03:00") }),
            item({ title: "futuro", createdAt: new Date("2026-07-20T10:00:00-03:00") }),
        ];
        const recent = filterLastDays(items, NOW);
        expect(recent.map(i => i.title)).toEqual(["Edição 42"]);
    });

    it("tolerates invalid dates", () => {
        const items = [item({ createdAt: new Date("not-a-date") })];
        expect(filterLastDays(items, NOW)).toEqual([]);
    });
});

describe("buildWeeklyDigest", () => {
    it("returns null for an empty week", () => {
        expect(buildWeeklyDigest([], NOW, BASE_URL)).toBeNull();
        expect(
            buildWeeklyDigest([item({ createdAt: new Date("2026-01-01") })], NOW, BASE_URL),
        ).toBeNull();
    });

    it("groups items by section and counts them in the subject", () => {
        const digest = buildWeeklyDigest(
            [
                item(),
                item({ section: "Estudar", title: "Aula de prompts", url: "/view/estudar/e-01" }),
            ],
            NOW,
            BASE_URL,
        );

        expect(digest).not.toBeNull();
        expect(digest!.itemCount).toBe(2);
        expect(digest!.subject).toContain("2 novidades");
        expect(digest!.html).toContain("Newsletter");
        expect(digest!.html).toContain("Estudar");
        expect(digest!.html).toContain("https://portal.example.com/view/newsletter/PPNEWS-042");
    });

    it("escapes HTML in titles", () => {
        const digest = buildWeeklyDigest(
            [item({ title: '<script>alert("x")</script>' })],
            NOW,
            BASE_URL,
        );
        expect(digest!.html).not.toContain("<script>");
        expect(digest!.html).toContain("&lt;script&gt;");
    });

    it("renders items without URL as plain text", () => {
        const digest = buildWeeklyDigest([item({ url: null, title: "Sem link" })], NOW, BASE_URL);
        expect(digest!.html).toContain("Sem link");
        expect(digest!.html).not.toContain('href="null"');
    });
});
