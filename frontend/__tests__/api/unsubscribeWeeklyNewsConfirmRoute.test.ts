import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.UNSUBSCRIBE_TOKEN_SECRET = "test-secret";

const { mockUnsubscribe } = vi.hoisted(() => ({ mockUnsubscribe: vi.fn() }));

vi.mock("@/infrastructure/di/container", () => ({
    default: {
        getCommunicationPreferenceRepository: () => ({ unsubscribe: mockUnsubscribe }),
    },
}));

const { signUnsubscribeToken } = await import("@/lib/email/unsubscribeToken");
const { POST } = await import("@/app/api/email/unsubscribe/weekly-news/confirm/route");

function confirmRequest(body: unknown): NextRequest {
    return new NextRequest("http://localhost/api/email/unsubscribe/weekly-news/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("POST /api/email/unsubscribe/weekly-news/confirm (footer link)", () => {
    beforeEach(() => {
        mockUnsubscribe.mockReset();
        mockUnsubscribe.mockResolvedValue(undefined);
    });

    it("confirma o cancelamento com origem email_body, sem exigir login", async () => {
        const token = signUnsubscribeToken("user-1", "weekly_news");
        const response = await POST(confirmRequest({ token }));

        expect(response.status).toBe(200);
        expect(mockUnsubscribe).toHaveBeenCalledWith("user-1", "weekly_news", "email_body");
    });

    it("token inválido não altera dados", async () => {
        const response = await POST(confirmRequest({ token: "garbage" }));

        expect(response.status).toBe(400);
        expect(mockUnsubscribe).not.toHaveBeenCalled();
    });

    it("payload sem token não altera dados", async () => {
        const response = await POST(confirmRequest({}));

        expect(response.status).toBe(400);
        expect(mockUnsubscribe).not.toHaveBeenCalled();
    });
});
