import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
    auth: {
        api: {
            getSession: vi.fn(),
        },
    },
}));

vi.mock("@/lib/db", () => ({
    pool: {
        query: vi.fn(),
    },
}));

import { GET } from "@/app/api/admin/users/today/route";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

const adminSession = { user: { role: "admin" } };

const mockRow = {
    id: "user-1",
    email: "joao@test.com",
    nome: "João Silva",
    celular: "11999990000",
    role: "user",
    createdAt: new Date("2026-05-11T14:00:00Z"),
    emailVerified: true,
    accept_email_updates: true,
    accept_whatsapp_updates: false,
    last_sign_in_at: new Date("2026-05-11T13:00:00Z"),
};

describe("GET /api/admin/users/today", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(auth.api.getSession).mockResolvedValue(adminSession as never);
        vi.mocked(pool.query).mockResolvedValue({ rows: [mockRow] } as never);
    });

    it("retorna 200 com usuários mapeados do banco de dados", async () => {
        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.users).toHaveLength(1);
        expect(body.users[0]).toMatchObject({
            id: "user-1",
            email: "joao@test.com",
            nome: "João Silva",
            isAdmin: false,
            emailVerified: true,
            acceptEmailUpdates: true,
            acceptWhatsappUpdates: false,
        });
    });

    it("retorna 403 para usuário sem role admin", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({ user: { role: "user" } } as never);

        const response = await GET();

        expect(response.status).toBe(403);
    });

    it("consulta pool diretamente — fetch() não é chamado (regressão ERR_INVALID_URL)", async () => {
        // Regression guard: if the route ever reverts to calling DIContainer/UseCase/SupabaseUserManagementRepository,
        // fetch('/api/admin/users?date=...') will be called server-side and throw ERR_INVALID_URL.
        // This test catches that regression without needing a running server.
        const fetchSpy = vi.spyOn(globalThis, "fetch");

        await GET();

        expect(pool.query).toHaveBeenCalledOnce();
        expect(fetchSpy).not.toHaveBeenCalled();
    });
});
