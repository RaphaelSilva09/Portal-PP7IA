import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockResolveContentFilePath } = vi.hoisted(() => ({
    mockResolveContentFilePath: vi.fn(),
}));

vi.mock("@/lib/contentStorage", () => ({
    resolveContentFilePath: mockResolveContentFilePath,
}));

import { HEAD } from "@/app/api/proxy-html/[type]/[slug]/route";

describe("proxy HTML route HEAD", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("confirms uploaded radar HTML exists without reading the file body", async () => {
        mockResolveContentFilePath.mockResolvedValueOnce({
            ok: true,
            absolutePath: "/storage/materiais/radar-de-oportunidades/001.html",
        });

        const response = await HEAD(new NextRequest("http://localhost/api/proxy-html/radar_oportunidades/001"), {
            params: Promise.resolve({ type: "radar_oportunidades", slug: "001" }),
        });

        expect(response.status).toBe(200);
    });

    it("preserves missing-file status for unavailable content", async () => {
        mockResolveContentFilePath.mockResolvedValueOnce({
            ok: false,
            status: 404,
            error: "Arquivo não encontrado",
        });

        const response = await HEAD(new NextRequest("http://localhost/api/proxy-html/radar_oportunidades/001"), {
            params: Promise.resolve({ type: "radar_oportunidades", slug: "001" }),
        });

        expect(response.status).toBe(404);
    });
});
