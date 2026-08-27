import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
    process.env.RESEND_API_KEY = "test_resend_key";
    process.env.UNSUBSCRIBE_TOKEN_SECRET = "test_unsubscribe_secret";
});

import {
    buildWeeklyDigestEmail,
    getWeeklyDigestSchedule,
    normalizeDigestItem,
    sendWeeklyDigest,
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
            unsubscribeUrl: "https://pp7ias-portal.com.br/unsubscribe/weekly-news?token=abc",
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
        expect(email.html).toContain("https://pp7ias-portal.com.br/unsubscribe/weekly-news?token=abc");
        expect(email.html).toContain("Cancelar inscrição");
        expect(email.html).toContain("text-align:center");
        expect(email.html).toMatch(/seu perfil<\/a>\.\s*<br><br>\s*N[aã]o quer mais receber as Novidades da semana\?/);
        expect(email.text).toContain("Newsletter da semana");
        expect(email.text).toContain("https://pp7ias-portal.com.br/unsubscribe/weekly-news?token=abc");
    });

    it("sends queued content and marks the queue after all deliveries succeed", async () => {
        const client = new FakeDigestClient({
            queue: [queueRow("11111111-1111-4111-8111-111111111111")],
            recipients: [recipient("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "ana@example.com")],
        });
        const resendClient = fakeResendClient([{ data: { id: "email-1" } }]);

        const result = await sendWeeklyDigest({
            force: true,
            now: new Date("2026-07-08T13:00:00.000Z"),
            pool: fakePool(client),
            resendClient,
        });

        expect(result).toMatchObject({ status: "completed", contentCount: 1, recipientCount: 1, sentCount: 1, failedCount: 0 });
        expect(client.run?.status).toBe("completed");
        expect(client.deliveries[0]).toMatchObject({ status: "sent", provider_message_id: "email-1" });
        expect(client.queue[0].sent_at).toBeInstanceOf(Date);
    });

    it("skips automatic runs outside main or production", async () => {
        await withEnv({ RAILWAY_ENVIRONMENT_NAME: "development", RAILWAY_GIT_BRANCH: "main" }, async () => {
            const client = new FakeDigestClient({
                queue: [queueRow("55555555-5555-4555-8555-555555555555")],
                recipients: [recipient("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "ana@example.com")],
            });
            const resendClient = fakeResendClient([{ data: { id: "email-1" } }]);

            const result = await sendWeeklyDigest({
                now: new Date("2026-07-08T13:00:00.000Z"),
                pool: fakePool(client),
                resendClient,
                logger: silentLogger,
            });

            expect(result).toMatchObject({ status: "skipped", contentCount: 0, recipientCount: 0, sentCount: 0, failedCount: 0 });
            expect(client.run).toBeNull();
            expect((resendClient as unknown as { emails: { send: ReturnType<typeof vi.fn> } }).emails.send).not.toHaveBeenCalled();
        });
    });

    it("never sends from development even when forced", async () => {
        await withEnv({ RAILWAY_ENVIRONMENT_NAME: "development", RAILWAY_GIT_BRANCH: "develop" }, async () => {
            const client = new FakeDigestClient({
                queue: [queueRow("77777777-7777-4777-8777-777777777777")],
                recipients: [recipient("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "ana@example.com")],
            });
            const resendClient = fakeResendClient([{ data: { id: "email-1" } }]);

            const result = await sendWeeklyDigest({
                force: true,
                now: new Date("2026-07-08T13:00:00.000Z"),
                pool: fakePool(client),
                resendClient,
                logger: silentLogger,
            });

            expect(result).toMatchObject({ status: "skipped", contentCount: 0, recipientCount: 0, sentCount: 0, failedCount: 0 });
            expect(client.run).toBeNull();
            expect((resendClient as unknown as { emails: { send: ReturnType<typeof vi.fn> } }).emails.send).not.toHaveBeenCalled();
        });
    });

    it("allows automatic runs on production", async () => {
        await withEnv({ RAILWAY_ENVIRONMENT_NAME: "production", RAILWAY_GIT_BRANCH: "main" }, async () => {
            const client = new FakeDigestClient({
                queue: [queueRow("66666666-6666-4666-8666-666666666666")],
                recipients: [recipient("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "ana@example.com")],
            });
            const resendClient = fakeResendClient([{ data: { id: "email-1" } }]);

            const result = await sendWeeklyDigest({
                now: new Date("2026-07-08T13:00:00.000Z"),
                pool: fakePool(client),
                resendClient,
            });

            expect(result).toMatchObject({ status: "completed", sentCount: 1, failedCount: 0 });
            expect(client.run?.status).toBe("completed");
        });
    });

    it("retries provider rate limits before marking a delivery failed", async () => {
        const client = new FakeDigestClient({
            queue: [queueRow("44444444-4444-4444-8444-444444444444")],
            recipients: [recipient("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "ana@example.com")],
        });
        const resendClient = fakeResendClient([
            { error: new Error("Too many requests. You can only make 10 requests per second.") },
            { data: { id: "email-after-retry" } },
        ]);
        const sendMock = (resendClient as unknown as { emails: { send: ReturnType<typeof vi.fn> } }).emails.send;

        const result = await sendWeeklyDigest({
            force: true,
            now: new Date("2026-07-08T13:00:00.000Z"),
            pool: fakePool(client),
            resendClient,
            sendIntervalMs: 0,
            rateLimitRetryDelayMs: 0,
            logger: silentLogger,
        });

        expect(result).toMatchObject({ status: "completed", sentCount: 1, failedCount: 0 });
        expect(sendMock).toHaveBeenCalledTimes(2);
        expect(client.deliveries[0]).toMatchObject({ status: "sent", provider_message_id: "email-after-retry", error: null });
    });

    it("retries failed deliveries without resetting previous sent totals", async () => {
        const client = new FakeDigestClient({
            queue: [queueRow("22222222-2222-4222-8222-222222222222")],
            recipients: [
                recipient("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "ana@example.com"),
                recipient("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", "bia@example.com"),
            ],
        });

        const firstAttempt = await sendWeeklyDigest({
            force: true,
            now: new Date("2026-07-08T13:00:00.000Z"),
            pool: fakePool(client),
            resendClient: fakeResendClient([{ data: { id: "email-1" } }, { error: new Error("temporary") }]),
            logger: silentLogger,
        });

        expect(firstAttempt).toMatchObject({ status: "partial", sentCount: 1, failedCount: 1 });
        expect(client.queue[0].sent_at).toBeNull();

        const secondAttempt = await sendWeeklyDigest({
            force: true,
            now: new Date("2026-07-08T13:30:00.000Z"),
            pool: fakePool(client),
            resendClient: fakeResendClient([{ data: { id: "email-2" } }]),
        });

        expect(secondAttempt).toMatchObject({ status: "completed", sentCount: 2, failedCount: 0 });
        expect(client.run).toMatchObject({ status: "completed", sent_count: 2, failed_count: 0 });
        expect(client.queue[0].sent_at).toBeInstanceOf(Date);
    });

    it("a recipient who cancels mid-run is skipped without being counted as a failure", async () => {
        const client = new FakeDigestClient({
            queue: [queueRow("88888888-8888-4888-8888-888888888888")],
            recipients: [
                recipient("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "ana@example.com"),
                recipient("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", "bia@example.com"),
            ],
            unsubscribedBeforeSend: ["bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"],
        });

        const result = await sendWeeklyDigest({
            force: true,
            now: new Date("2026-07-08T13:00:00.000Z"),
            pool: fakePool(client),
            resendClient: fakeResendClient([{ data: { id: "email-1" } }]),
            logger: silentLogger,
        });

        // Not "partial": a mid-run unsubscribe is not an operational failure.
        expect(result).toMatchObject({ status: "completed", sentCount: 1, failedCount: 0 });
        expect(client.run).toMatchObject({ status: "completed", error: null });
        // Queue must still be marked sent — otherwise this content re-appears next week for everyone.
        expect(client.queue[0].sent_at).toBeInstanceOf(Date);
        expect(client.deliveries.find((d) => d.user_id === "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")).toMatchObject({
            status: "failed",
            error: "Cancelado antes do envio",
        });
    });

    it("marks the run as failed when an unexpected error interrupts the job", async () => {
        const client = new FakeDigestClient({
            queue: [queueRow("33333333-3333-4333-8333-333333333333")],
            recipients: [recipient("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "ana@example.com")],
            recipientError: new Error("database unavailable"),
        });

        await expect(sendWeeklyDigest({
            force: true,
            now: new Date("2026-07-08T13:00:00.000Z"),
            pool: fakePool(client),
            resendClient: fakeResendClient([]),
            logger: silentLogger,
        })).rejects.toThrow("database unavailable");

        expect(client.run).toMatchObject({ status: "failed", error: "database unavailable" });
    });
});

type QueryResult<T> = { rows: T[] };

interface FakeQueueRow {
    id: string;
    table_name: string;
    record_id: string;
    record_data: Record<string, unknown>;
    created_at: Date;
    sent_at: Date | null;
}

interface FakeRecipient {
    id: string;
    email: string;
    nome: string | null;
}

interface FakeDelivery {
    run_id: string;
    user_id: string;
    email: string;
    status: "pending" | "sent" | "failed";
    provider_message_id: string | null;
    error: string | null;
    created_at: Date;
    sent_at: Date | null;
}

interface FakeRun {
    id: string;
    digest_key: string;
    status: "running" | "skipped" | "empty" | "completed" | "partial" | "failed";
    content_count: number;
    recipient_count: number;
    sent_count: number;
    failed_count: number;
    error: string | null;
    finished_at: Date | null;
}

class FakeDigestClient {
    readonly queue: FakeQueueRow[];
    readonly recipients: FakeRecipient[];
    readonly deliveries: FakeDelivery[] = [];
    readonly recipientError?: Error;
    readonly unsubscribedBeforeSend: Set<string>;
    run: FakeRun | null = null;

    constructor(options: {
        queue: FakeQueueRow[];
        recipients: FakeRecipient[];
        recipientError?: Error;
        unsubscribedBeforeSend?: string[];
    }) {
        this.queue = options.queue;
        this.recipients = options.recipients;
        this.recipientError = options.recipientError;
        this.unsubscribedBeforeSend = new Set(options.unsubscribedBeforeSend ?? []);
    }

    async query<T = unknown>(sql: string, values: readonly unknown[] = []): Promise<QueryResult<T>> {
        if (sql.includes("INSERT INTO public.email_digest_runs")) {
            if (this.run?.status === "completed") return rows<T>([]);
            this.run = {
                id: this.run?.id ?? "99999999-9999-4999-8999-999999999999",
                digest_key: String(values[0]),
                status: "running",
                content_count: this.run?.content_count ?? 0,
                recipient_count: this.run?.recipient_count ?? 0,
                sent_count: this.run?.sent_count ?? 0,
                failed_count: this.run?.failed_count ?? 0,
                error: null,
                finished_at: null,
            };
            return rows<T>([{ id: this.run.id }]);
        }

        if (sql.includes("FROM public.content_digest_queue") && sql.includes("WHERE sent_at IS NULL")) {
            const supported = new Set(values[0] as string[]);
            const maxItems = Number(values[1]);
            return rows<T>(
                this.queue
                    .filter((item) => item.sent_at === null && supported.has(item.table_name))
                    .slice(0, maxItems),
            );
        }

        if (sql.includes('FROM "user"')) {
            if (this.recipientError) throw this.recipientError;
            return rows<T>(this.recipients);
        }

        if (sql.includes("FROM public.communication_preferences") && sql.includes("SELECT enabled")) {
            const userId = String(values[0]);
            return rows<T>([{ enabled: !this.unsubscribedBeforeSend.has(userId) }]);
        }

        if (sql.includes("SET content_count")) {
            if (this.run) {
                this.run.content_count = Number(values[1]);
                this.run.recipient_count = Number(values[2]);
            }
            return rows<T>([]);
        }

        if (sql.includes("INSERT INTO public.email_digest_deliveries")) {
            const runId = String(values[0]);
            const userIds = values[1] as string[];
            const emails = values[2] as string[];
            userIds.forEach((userId, index) => {
                if (this.deliveries.some((delivery) => delivery.run_id === runId && delivery.user_id === userId)) return;
                this.deliveries.push({
                    run_id: runId,
                    user_id: userId,
                    email: emails[index],
                    status: "pending",
                    provider_message_id: null,
                    error: null,
                    created_at: new Date(),
                    sent_at: null,
                });
            });
            return rows<T>([]);
        }

        if (sql.includes("FROM public.email_digest_deliveries") && sql.includes("status IN")) {
            return rows<T>(
                this.deliveries
                    .filter((delivery) => delivery.run_id === values[0] && (delivery.status === "pending" || delivery.status === "failed"))
                    .map((delivery) => ({ id: delivery.user_id, email: delivery.email, nome: null })),
            );
        }

        if (sql.includes("SET status = 'sent'")) {
            const delivery = this.findDelivery(values);
            if (delivery) {
                delivery.status = "sent";
                delivery.sent_at = new Date();
                delivery.provider_message_id = String(values[2] ?? "") || null;
                delivery.error = null;
            }
            return rows<T>([]);
        }

        if (sql.includes("SET status = 'failed'")) {
            const delivery = this.findDelivery(values);
            if (delivery) {
                delivery.status = "failed";
                delivery.error = String(values[2]);
            }
            return rows<T>([]);
        }

        if (sql.includes("COUNT(*) FILTER")) {
            const cancelledError = String(values[1]);
            return rows<T>([{
                sent_count: String(this.deliveries.filter((delivery) => delivery.run_id === values[0] && delivery.status === "sent").length),
                failed_count: String(this.deliveries.filter((delivery) => delivery.run_id === values[0] && delivery.status === "failed" && delivery.error !== cancelledError).length),
                cancelled_count: String(this.deliveries.filter((delivery) => delivery.run_id === values[0] && delivery.status === "failed" && delivery.error === cancelledError).length),
            }]);
        }

        if (sql.includes("UPDATE public.content_digest_queue")) {
            const ids = new Set(values[0] as string[]);
            this.queue.forEach((item) => {
                if (ids.has(item.id)) item.sent_at = new Date();
            });
            return rows<T>([]);
        }

        if (sql.includes("UPDATE public.email_digest_runs") && sql.includes("SET status = $2")) {
            if (this.run) {
                this.run.status = values[1] as FakeRun["status"];
                this.run.finished_at = new Date();
                this.run.sent_count = Number(values[2]);
                this.run.failed_count = Number(values[3]);
                this.run.error = values[4] === null ? null : String(values[4]);
            }
            return rows<T>([]);
        }

        throw new Error(`Unhandled fake query: ${sql}`);
    }

    release() {
        return undefined;
    }

    private findDelivery(values: readonly unknown[]): FakeDelivery | undefined {
        return this.deliveries.find((delivery) => delivery.run_id === values[0] && delivery.user_id === values[1]);
    }
}

function rows<T>(rowsValue: unknown[]): QueryResult<T> {
    return { rows: rowsValue as T[] };
}

function queueRow(id: string): FakeQueueRow {
    return {
        id,
        table_name: "newsletters",
        record_id: id,
        record_data: {
            title: "Digest item",
            html_path: "newsletters/digest-item.html",
        },
        created_at: new Date("2026-07-08T12:00:00.000Z"),
        sent_at: null,
    };
}

function recipient(id: string, email: string): FakeRecipient {
    return { id, email, nome: null };
}

function fakePool(client: FakeDigestClient) {
    return {
        connect: async () => client,
    } as never;
}

function fakeResendClient(results: Array<{ data?: { id: string }; error?: Error }>) {
    return {
        emails: {
            send: vi.fn(async () => {
                const result = results.shift();
                if (!result) throw new Error("unexpected send");
                return { data: result.data ?? null, error: result.error ?? null };
            }),
        },
    } as never;
}

async function withEnv<T>(values: Record<string, string>, run: () => Promise<T>): Promise<T> {
    const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
    for (const [key, value] of Object.entries(values)) {
        process.env[key] = value;
    }
    try {
        return await run();
    } finally {
        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = value;
            }
        }
    }
}

const silentLogger = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};
