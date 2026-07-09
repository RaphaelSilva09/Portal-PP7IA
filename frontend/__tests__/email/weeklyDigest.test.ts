import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
    process.env.RESEND_API_KEY = "test_resend_key";
});

import {
    buildWeeklyDigestEmail,
    getWeeklyDigestSchedule,
    normalizeDigestItem,
    shouldRunWeeklyDigest,
} from "@/lib/email/weekly-digest";

describe("weekly digest email", () => {
    it("recommends Wednesday at 10:00 in Sao Paulo time", () => {
        expect(getWeeklyDigestSchedule()).toEqual({
            dayOfWeek: "wednesday",
            hour: 10,
            minute: 0,
            timeZone: "America/Sao_Paulo",
            railwayCronUtc: "0 13 * * 3",
        });
    });

    it("runs only on Wednesday in Sao Paulo unless forced", () => {
        const wednesdayMorningUtc = new Date("2026-07-08T13:00:00.000Z");
        const thursdayMorningUtc = new Date("2026-07-09T13:00:00.000Z");

        expect(shouldRunWeeklyDigest(wednesdayMorningUtc)).toBe(true);
        expect(shouldRunWeeklyDigest(thursdayMorningUtc)).toBe(false);
        expect(shouldRunWeeklyDigest(thursdayMorningUtc, { force: true })).toBe(true);
    });

    it("normalizes queued content into public links", () => {
        const item = normalizeDigestItem({
            id: "queue-1",
            table_name: "newsletters",
            record_id: "42",
            record_data: {
                title: "  PP-NEWS #42  ",
                read_time: 7,
                html_path: "newsletters/pp-news-42.html",
            },
            created_at: new Date("2026-07-08T12:00:00.000Z"),
        });

        expect(item).toMatchObject({
            queueId: "queue-1",
            tableName: "newsletters",
            recordId: "42",
            title: "PP-NEWS #42",
            readTime: 7,
            href: "https://pp7ias-portal.com.br/view/newsletter/pp-news-42",
        });
    });

    it("renders a digest email with grouped content and preference link", () => {
        const email = buildWeeklyDigestEmail({
            siteUrl: "https://pp7ias-portal.com.br",
            items: [
                {
                    queueId: "q1",
                    tableName: "newsletters",
                    recordId: "1",
                    title: "Newsletter da semana",
                    readTime: 5,
                    href: "https://pp7ias-portal.com.br/view/newsletter/newsletter-da-semana",
                    createdAt: new Date("2026-07-08T12:00:00.000Z"),
                },
                {
                    queueId: "q2",
                    tableName: "biblioteca",
                    recordId: "2",
                    title: "Guia de IA",
                    readTime: 9,
                    href: null,
                    createdAt: new Date("2026-07-08T12:00:00.000Z"),
                },
            ],
        });

        expect(email.subject).toBe("PP7+IAS: novidades da semana");
        expect(email.html).toContain("Newsletter da semana");
        expect(email.html).toContain("Biblioteca");
        expect(email.html).toContain("https://pp7ias-portal.com.br/user");
        expect(email.text).toContain("Newsletter da semana");
    });
});
