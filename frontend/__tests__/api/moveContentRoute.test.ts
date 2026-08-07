import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockGetSession, mockExecute } = vi.hoisted(() => ({
    mockGetSession: vi.fn(),
    mockExecute: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
    auth: { api: { getSession: mockGetSession } },
}));

vi.mock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/infrastructure/di/container", () => ({
    default: {
        getMoveContentWithFilesUseCase: () => ({ execute: mockExecute }),
    },
}));

import { POST } from "@/app/api/admin/content/[type]/[id]/move/route";

function makeRequest(body: unknown): NextRequest {
    return new NextRequest("http://localhost/api/admin/content/radar_oportunidades/7/move", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

describe("POST /api/admin/content/[type]/[id]/move", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetSession.mockResolvedValue({ user: { role: "admin" } });
    });

    it("rejeita quem não é admin", async () => {
        mockGetSession.mockResolvedValue({ user: { role: "leitor" } });

        const response = await POST(makeRequest({ targetType: "estudar" }), {
            params: Promise.resolve({ type: "radar_oportunidades", id: "7" }),
        });

        expect(response.status).toBe(403);
        expect(mockExecute).not.toHaveBeenCalled();
    });

    it("rejeita tipo de origem inválido", async () => {
        const response = await POST(makeRequest({ targetType: "estudar" }), {
            params: Promise.resolve({ type: "nao-existe", id: "7" }),
        });

        expect(response.status).toBe(400);
        expect(mockExecute).not.toHaveBeenCalled();
    });

    it("rejeita ID inválido", async () => {
        const response = await POST(makeRequest({ targetType: "estudar" }), {
            params: Promise.resolve({ type: "radar_oportunidades", id: "abc" }),
        });

        expect(response.status).toBe(400);
        expect(mockExecute).not.toHaveBeenCalled();
    });

    it("rejeita bloco de destino ausente ou inválido", async () => {
        const response = await POST(makeRequest({ targetType: "nao-existe" }), {
            params: Promise.resolve({ type: "radar_oportunidades", id: "7" }),
        });

        expect(response.status).toBe(400);
        expect(mockExecute).not.toHaveBeenCalled();
    });

    it("chama o use case e retorna 200 com o item movido", async () => {
        mockExecute.mockResolvedValue({ id: 14, title: "Conteúdo de teste" });

        const response = await POST(makeRequest({ targetType: "estudar" }), {
            params: Promise.resolve({ type: "radar_oportunidades", id: "7" }),
        });

        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json.id).toBe(14);
        expect(mockExecute).toHaveBeenCalledWith({
            sourceType: "radar_oportunidades",
            id: 7,
            targetType: "estudar",
            tema: undefined,
            ebookId: undefined,
            partOrder: undefined,
        });
    });

    it("retorna 500 com a mensagem de erro quando o use case falha", async () => {
        mockExecute.mockRejectedValue(new Error("Conteúdo radar_oportunidades#7 não encontrado"));

        const response = await POST(makeRequest({ targetType: "estudar" }), {
            params: Promise.resolve({ type: "radar_oportunidades", id: "7" }),
        });

        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json.error).toContain("não encontrado");
    });
});
