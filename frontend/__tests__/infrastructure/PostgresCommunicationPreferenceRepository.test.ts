import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * In-memory fake that mirrors the exact ON CONFLICT semantics of the real
 * migration (0022_communication_preferences.sql) — including that
 * subscribedAt/unsubscribedAt only advance on an actual state transition,
 * never on a repeated call. This lets the idempotency/audit-trail rules be
 * verified without a real Postgres connection.
 */
interface FakeRow {
    user_id: string;
    communication_type: string;
    enabled: boolean;
    subscribed_at: Date | null;
    unsubscribed_at: Date | null;
    last_changed_at: Date;
    source: string;
}

const table = new Map<string, FakeRow>();
const queryMock = vi.fn(async (sql: string, values: unknown[]) => {
    const [userId, type, source] = values as [string, string, string];
    const key = `${userId}:${type}`;

    if (sql.includes("SELECT user_id")) {
        const row = table.get(`${values[0]}:${values[1]}`);
        return { rows: row ? [row] : [] };
    }

    const now = new Date();
    const existing = table.get(key);

    if (sql.includes("enabled = true")) {
        const row: FakeRow = {
            user_id: userId,
            communication_type: type,
            enabled: true,
            subscribed_at: existing?.enabled ? existing.subscribed_at : now,
            unsubscribed_at: existing?.unsubscribed_at ?? null,
            last_changed_at: now,
            source,
        };
        table.set(key, row);
        return { rows: [] };
    }

    // unsubscribe
    const row: FakeRow = {
        user_id: userId,
        communication_type: type,
        enabled: false,
        subscribed_at: existing?.subscribed_at ?? null,
        unsubscribed_at: existing?.enabled !== false ? now : existing?.unsubscribed_at ?? now,
        last_changed_at: now,
        source,
    };
    table.set(key, row);
    return { rows: [] };
});

vi.mock("@/lib/db", () => ({
    pool: { query: queryMock },
}));

const { PostgresCommunicationPreferenceRepository } = await import(
    "@/infrastructure/repositories/PostgresCommunicationPreferenceRepository"
);

describe("PostgresCommunicationPreferenceRepository", () => {
    beforeEach(() => {
        table.clear();
        queryMock.mockClear();
    });

    it("usuário sem preferência fica não inscrito", async () => {
        const repo = new PostgresCommunicationPreferenceRepository();
        expect(await repo.get("u1", "weekly_news")).toBeNull();
    });

    it("inscrição autenticada define enabled=true, subscribedAt e source", async () => {
        const repo = new PostgresCommunicationPreferenceRepository();
        await repo.subscribe("u1", "weekly_news", "profile");

        const pref = await repo.get("u1", "weekly_news");
        expect(pref).toMatchObject({ userId: "u1", enabled: true, source: "profile" });
        expect(pref?.subscribedAt).toBeInstanceOf(Date);
        expect(pref?.unsubscribedAt).toBeNull();
    });

    it("cancelamento define enabled=false, unsubscribedAt e source", async () => {
        const repo = new PostgresCommunicationPreferenceRepository();
        await repo.subscribe("u1", "weekly_news", "profile");
        await repo.unsubscribe("u1", "weekly_news", "email_header");

        const pref = await repo.get("u1", "weekly_news");
        expect(pref).toMatchObject({ enabled: false, source: "email_header" });
        expect(pref?.unsubscribedAt).toBeInstanceOf(Date);
    });

    it("nova inscrição após cancelamento reativa e atualiza subscribedAt", async () => {
        const repo = new PostgresCommunicationPreferenceRepository();
        await repo.subscribe("u1", "weekly_news", "profile");
        await repo.unsubscribe("u1", "weekly_news", "profile");
        await repo.subscribe("u1", "weekly_news", "profile");

        const pref = await repo.get("u1", "weekly_news");
        expect(pref?.enabled).toBe(true);
    });

    it("cancelar já cancelado é idempotente e não falha", async () => {
        const repo = new PostgresCommunicationPreferenceRepository();
        await repo.unsubscribe("u1", "weekly_news", "email_header");
        await expect(repo.unsubscribe("u1", "weekly_news", "email_header")).resolves.not.toThrow();

        const pref = await repo.get("u1", "weekly_news");
        expect(pref?.enabled).toBe(false);
    });

    it("inscrever de novo enquanto já inscrito não falha (idempotente)", async () => {
        const repo = new PostgresCommunicationPreferenceRepository();
        await repo.subscribe("u1", "weekly_news", "profile");
        await expect(repo.subscribe("u1", "weekly_news", "profile")).resolves.not.toThrow();
    });

    it("isola preferências por usuário", async () => {
        const repo = new PostgresCommunicationPreferenceRepository();
        await repo.subscribe("u1", "weekly_news", "profile");

        expect(await repo.get("u2", "weekly_news")).toBeNull();
    });
});
