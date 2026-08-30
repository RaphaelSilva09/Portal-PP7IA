import { beforeEach, describe, expect, it, vi } from "vitest";

interface FakeRow {
    user_id: string;
    device_category: string;
    preferences: Record<string, unknown>;
    updated_at: Date;
}

const table = new Map<string, FakeRow>();
const queryMock = vi.fn(async (sql: string, values: unknown[]) => {
    if (sql.includes("SELECT user_id")) {
        const [userId, category] = values as [string, string];
        const row = table.get(`${userId}:${category}`);
        return { rows: row ? [row] : [] };
    }

    const [userId, category, preferencesJson] = values as [string, string, string];
    const row: FakeRow = {
        user_id: userId,
        device_category: category,
        preferences: JSON.parse(preferencesJson),
        updated_at: new Date(),
    };
    table.set(`${userId}:${category}`, row);
    return { rows: [] };
});

vi.mock("@/lib/db", () => ({
    pool: { query: queryMock },
}));

const { PostgresAccessibilityPreferenceRepository } = await import(
    "@/infrastructure/repositories/PostgresAccessibilityPreferenceRepository"
);

describe("PostgresAccessibilityPreferenceRepository", () => {
    beforeEach(() => {
        table.clear();
        queryMock.mockClear();
    });

    it("usuário sem preferência sincronizada retorna null", async () => {
        const repo = new PostgresAccessibilityPreferenceRepository();
        expect(await repo.get("u1", "mobile")).toBeNull();
    });

    it("upsert grava e get devolve o mesmo valor", async () => {
        const repo = new PostgresAccessibilityPreferenceRepository();
        await repo.upsert("u1", "mobile", { readingPrefs: { fontScale: 1.3 }, portalFontScale: 1.1 });

        const pref = await repo.get("u1", "mobile");
        expect(pref).toMatchObject({
            userId: "u1",
            deviceCategory: "mobile",
            preferences: { readingPrefs: { fontScale: 1.3 }, portalFontScale: 1.1 },
        });
        expect(pref?.updatedAt).toBeInstanceOf(Date);
    });

    it("upsert repetido substitui o valor anterior (idempotente)", async () => {
        const repo = new PostgresAccessibilityPreferenceRepository();
        await repo.upsert("u1", "mobile", { portalFontScale: 1 });
        await repo.upsert("u1", "mobile", { portalFontScale: 1.2 });

        const pref = await repo.get("u1", "mobile");
        expect(pref?.preferences).toEqual({ portalFontScale: 1.2 });
    });

    it("isola preferências por categoria de dispositivo do mesmo usuário", async () => {
        const repo = new PostgresAccessibilityPreferenceRepository();
        await repo.upsert("u1", "mobile", { portalFontScale: 1.3 });
        await repo.upsert("u1", "non_mobile", { portalFontScale: 1 });

        expect((await repo.get("u1", "mobile"))?.preferences).toEqual({ portalFontScale: 1.3 });
        expect((await repo.get("u1", "non_mobile"))?.preferences).toEqual({ portalFontScale: 1 });
    });

    it("isola preferências por usuário", async () => {
        const repo = new PostgresAccessibilityPreferenceRepository();
        await repo.upsert("u1", "mobile", { portalFontScale: 1.3 });

        expect(await repo.get("u2", "mobile")).toBeNull();
    });
});
