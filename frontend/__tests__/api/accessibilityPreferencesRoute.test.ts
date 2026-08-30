import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockGetSession, mockGet, mockUpsert, mockHeaders } = vi.hoisted(() => ({
    mockGetSession: vi.fn(),
    mockGet: vi.fn(),
    mockUpsert: vi.fn(),
    mockHeaders: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
    auth: { api: { getSession: mockGetSession } },
}));

vi.mock("next/headers", () => ({
    headers: mockHeaders,
}));

vi.mock("@/infrastructure/di/container", () => ({
    default: {
        getAccessibilityPreferenceRepository: () => ({
            get: mockGet,
            upsert: mockUpsert,
        }),
    },
}));

const { GET, POST } = await import("@/app/api/user/accessibility-preferences/route");

const MOBILE_UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const DESKTOP_UA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15";

function headersFor(ua: string) {
    return new Headers({ "user-agent": ua });
}

function postRequest(body: unknown): NextRequest {
    return new NextRequest("http://localhost/api/user/accessibility-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("GET/POST /api/user/accessibility-preferences", () => {
    beforeEach(() => {
        mockGetSession.mockReset();
        mockGet.mockReset();
        mockUpsert.mockReset();
        mockHeaders.mockReset();
        mockUpsert.mockResolvedValue(undefined);
        mockHeaders.mockResolvedValue(headersFor(DESKTOP_UA));
    });

    it("GET sem sessão retorna 401", async () => {
        mockGetSession.mockResolvedValue(null);
        const response = await GET();
        expect(response.status).toBe(401);
        expect(mockGet).not.toHaveBeenCalled();
    });

    it("GET sem preferência sincronizada retorna preferences: null", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
        mockGet.mockResolvedValue(null);

        const response = await GET();
        const json = await response.json();

        expect(json).toEqual({ preferences: null });
    });

    it("GET devolve o perfil salvo para a categoria do dispositivo atual (derivada do User-Agent)", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
        mockHeaders.mockResolvedValue(headersFor(MOBILE_UA));
        mockGet.mockResolvedValue({
            userId: "user-1",
            deviceCategory: "mobile",
            preferences: { portalFontScale: 1.2 },
            updatedAt: new Date(),
        });

        const response = await GET();
        const json = await response.json();

        expect(json).toEqual({ preferences: { portalFontScale: 1.2 } });
        expect(mockGet).toHaveBeenCalledWith("user-1", "mobile");
    });

    it("POST sem sessão retorna 401 e não grava", async () => {
        mockGetSession.mockResolvedValue(null);
        const response = await POST(postRequest({ portalFontScale: 1.1 }));

        expect(response.status).toBe(401);
        expect(mockUpsert).not.toHaveBeenCalled();
    });

    it("POST com UA mobile grava na categoria mobile", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
        mockHeaders.mockResolvedValue(headersFor(MOBILE_UA));

        const response = await POST(postRequest({ portalFontScale: 1.2 }));

        expect(response.status).toBe(200);
        expect(mockUpsert).toHaveBeenCalledWith(
            "user-1",
            "mobile",
            expect.objectContaining({ portalFontScale: 1.2 }),
        );
    });

    it("POST com UA desktop grava na categoria non_mobile, usando o id da sessão (nunca do corpo)", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1" } });

        const response = await POST(postRequest({ portalFontScale: 1.2, userId: "attacker-controlled-id" }));

        expect(response.status).toBe(200);
        expect(mockUpsert).toHaveBeenCalledWith("user-1", "non_mobile", expect.anything());
    });

    it("POST sanitiza valores inválidos em vez de rejeitar (mesma tolerância de readingPrefs/portalTypography)", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1" } });

        const response = await POST(postRequest({ readingPrefs: { fontScale: 999 }, portalFontScale: "nope" }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.preferences.portalFontScale).toBe(1);
        expect(json.preferences.readingPrefs.fontScale).toBe(1);
    });

    it("POST com corpo não-objeto retorna 400 e não grava", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
        const response = await POST(postRequest(null));

        expect(response.status).toBe(400);
        expect(mockUpsert).not.toHaveBeenCalled();
    });
});
