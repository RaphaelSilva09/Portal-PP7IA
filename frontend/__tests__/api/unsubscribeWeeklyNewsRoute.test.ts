import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.UNSUBSCRIBE_TOKEN_SECRET = "test-secret";

const { mockUnsubscribe, mockSubscribe } = vi.hoisted(() => ({
    mockUnsubscribe: vi.fn(),
    mockSubscribe: vi.fn(),
}));

vi.mock("@/infrastructure/di/container", () => ({
    default: {
        getCommunicationPreferenceRepository: () => ({
            unsubscribe: mockUnsubscribe,
            subscribe: mockSubscribe,
        }),
    },
}));

const { signUnsubscribeToken } = await import("@/lib/email/unsubscribeToken");
const { POST } = await import("@/app/api/email/unsubscribe/weekly-news/route");

function oneClickRequest(token: string | null, body = "List-Unsubscribe=One-Click"): NextRequest {
    const url = token
        ? `http://localhost/api/email/unsubscribe/weekly-news?token=${encodeURIComponent(token)}`
        : "http://localhost/api/email/unsubscribe/weekly-news";
    return new NextRequest(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    });
}

describe("POST /api/email/unsubscribe/weekly-news (RFC 8058)", () => {
    beforeEach(() => {
        mockUnsubscribe.mockReset();
        mockSubscribe.mockReset();
        mockUnsubscribe.mockResolvedValue(undefined);
    });

    it("POST válido com token e corpo corretos cancela e retorna sucesso", async () => {
        const token = signUnsubscribeToken("user-1", "weekly_news");
        const response = await POST(oneClickRequest(token));

        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(mockUnsubscribe).toHaveBeenCalledWith("user-1", "weekly_news", "email_header");
        expect(mockSubscribe).not.toHaveBeenCalled();
    });

    it("segundo POST continua retornando sucesso (idempotente)", async () => {
        const token = signUnsubscribeToken("user-1", "weekly_news");
        await POST(oneClickRequest(token));
        const second = await POST(oneClickRequest(token));

        expect(second.status).toBe(200);
        expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
    });

    it("token ausente não altera dados", async () => {
        const response = await POST(oneClickRequest(null));

        expect(response.status).toBe(400);
        expect(mockUnsubscribe).not.toHaveBeenCalled();
    });

    it("token adulterado não altera dados", async () => {
        const token = signUnsubscribeToken("user-1", "weekly_news");
        const tampered = `${token.slice(0, -2)}zz`;
        const response = await POST(oneClickRequest(tampered));

        expect(response.status).toBe(400);
        expect(mockUnsubscribe).not.toHaveBeenCalled();
    });

    it("corpo fora do padrão RFC 8058 não altera dados", async () => {
        const token = signUnsubscribeToken("user-1", "weekly_news");
        const response = await POST(oneClickRequest(token, "something=else"));

        expect(response.status).toBe(400);
        expect(mockUnsubscribe).not.toHaveBeenCalled();
    });

    it("não exige login: nenhuma sessão é consultada para processar o cancelamento", async () => {
        const token = signUnsubscribeToken("user-1", "weekly_news");
        const response = await POST(oneClickRequest(token));

        expect(response.status).toBe(200);
        // A rota nunca importa/chama getUser() — confirmado pela ausência de mock/erro de sessão.
    });

    it("não redireciona (sempre responde JSON, nunca 3xx)", async () => {
        const token = signUnsubscribeToken("user-1", "weekly_news");
        const response = await POST(oneClickRequest(token));

        expect(response.status).toBeLessThan(300);
        expect(response.headers.get("location")).toBeNull();
    });

    it("GET não está implementado — não existe caminho para cancelar por GET acidental", async () => {
        const routeModule = await import("@/app/api/email/unsubscribe/weekly-news/route");
        expect((routeModule as Record<string, unknown>).GET).toBeUndefined();
    });
});
