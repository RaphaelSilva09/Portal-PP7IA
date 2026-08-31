import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockGetSession, mockGet, mockSubscribe, mockUnsubscribe } = vi.hoisted(() => ({
    mockGetSession: vi.fn(),
    mockGet: vi.fn(),
    mockSubscribe: vi.fn(),
    mockUnsubscribe: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
    auth: { api: { getSession: mockGetSession } },
}));

vi.mock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/infrastructure/di/container", () => ({
    default: {
        getCommunicationPreferenceRepository: () => ({
            get: mockGet,
            subscribe: mockSubscribe,
            unsubscribe: mockUnsubscribe,
        }),
    },
}));

const { GET, POST } = await import("@/app/api/user/preferences/weekly-news/route");

function postRequest(body: unknown): NextRequest {
    return new NextRequest("http://localhost/api/user/preferences/weekly-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("GET/POST /api/user/preferences/weekly-news", () => {
    beforeEach(() => {
        mockGetSession.mockReset();
        mockGet.mockReset();
        mockSubscribe.mockReset();
        mockUnsubscribe.mockReset();
        mockSubscribe.mockResolvedValue(undefined);
        mockUnsubscribe.mockResolvedValue(undefined);
    });

    it("GET sem sessão retorna 401", async () => {
        mockGetSession.mockResolvedValue(null);
        const response = await GET();
        expect(response.status).toBe(401);
        expect(mockGet).not.toHaveBeenCalled();
    });

    it("GET mostra o estado persistido do usuário autenticado", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1", email: "a@example.com" } });
        mockGet.mockResolvedValue({ userId: "user-1", communicationType: "weekly_news", enabled: true });

        const response = await GET();
        const json = await response.json();

        expect(json).toEqual({ enabled: true });
        expect(mockGet).toHaveBeenCalledWith("user-1", "weekly_news");
    });

    it("GET sem registro prévio retorna não inscrito", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
        mockGet.mockResolvedValue(null);

        const response = await GET();
        const json = await response.json();

        expect(json).toEqual({ enabled: false });
    });

    it("POST sem sessão retorna 401 e não chama o repositório", async () => {
        mockGetSession.mockResolvedValue(null);
        const response = await POST(postRequest({ enabled: true }));

        expect(response.status).toBe(401);
        expect(mockSubscribe).not.toHaveBeenCalled();
        expect(mockUnsubscribe).not.toHaveBeenCalled();
    });

    it("POST enabled=true inscreve com origem profile, usando o id da sessão (nunca do corpo)", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1" } });

        const response = await POST(postRequest({ enabled: true, userId: "attacker-controlled-id" }));

        expect(response.status).toBe(200);
        expect(mockSubscribe).toHaveBeenCalledWith("user-1", "weekly_news", "profile");
    });

    it("POST enabled=false cancela com origem profile", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1" } });

        const response = await POST(postRequest({ enabled: false }));

        expect(response.status).toBe(200);
        expect(mockUnsubscribe).toHaveBeenCalledWith("user-1", "weekly_news", "profile");
    });

    it("POST com payload inválido retorna 400", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1" } });

        const response = await POST(postRequest({ enabled: "yes" }));

        expect(response.status).toBe(400);
        expect(mockSubscribe).not.toHaveBeenCalled();
        expect(mockUnsubscribe).not.toHaveBeenCalled();
    });
});
