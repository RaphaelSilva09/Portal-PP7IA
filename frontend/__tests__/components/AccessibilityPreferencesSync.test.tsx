import { act, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuthState } = vi.hoisted(() => ({
    mockAuthState: { user: null as unknown },
}));

vi.mock("@/context/AuthContext", () => ({
    useAuth: vi.fn(() => mockAuthState),
}));

import AccessibilityPreferencesSync from "@/components/AccessibilityPreferencesSync";
import { loadReadingPrefs, READING_PREFS_STORAGE_KEY, saveReadingPrefs } from "@/lib/readingPrefs";
import { loadPortalFontScale } from "@/lib/portalTypography";

function jsonResponse(body: unknown, status = 200): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: vi.fn().mockResolvedValue(body),
    } as Pick<Response, "ok" | "status" | "json"> as Response;
}

describe("AccessibilityPreferencesSync", () => {
    beforeEach(() => {
        window.localStorage.clear();
        mockAuthState.user = null;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("sem usuário logado, não chama o servidor", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch");
        render(<AccessibilityPreferencesSync />);

        await new Promise(resolve => setTimeout(resolve, 10));
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("logado sem perfil no servidor, semeia o servidor com o valor local atual do dispositivo", async () => {
        window.localStorage.setItem(
            READING_PREFS_STORAGE_KEY,
            JSON.stringify({ fontScale: 1.3, weight: "bold", lineHeight: 1.7 }),
        );
        mockAuthState.user = { id: "user-1" };
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ preferences: null }));

        render(<AccessibilityPreferencesSync />);

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith(
                "/api/user/accessibility-preferences",
                expect.objectContaining({ method: "POST" }),
            );
        });

        const postCall = fetchSpy.mock.calls.find(([, opts]) => (opts as RequestInit | undefined)?.method === "POST");
        const sentBody = JSON.parse((postCall?.[1] as RequestInit).body as string);
        expect(sentBody.readingPrefs.fontScale).toBe(1.3);
    });

    it("logado com perfil salvo no servidor, aplica no dispositivo atual", async () => {
        mockAuthState.user = { id: "user-1" };
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            jsonResponse({
                preferences: {
                    readingPrefs: { fontScale: 1.45, weight: "medium", lineHeight: null },
                    portalFontScale: 1.1,
                },
            }),
        );

        render(<AccessibilityPreferencesSync />);

        await waitFor(() => {
            expect(loadReadingPrefs().fontScale).toBe(1.45);
        });
        expect(loadPortalFontScale()).toBe(1.1);
    });

    it("aplicar o valor do servidor não gera um POST de eco", async () => {
        mockAuthState.user = { id: "user-1" };
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            jsonResponse({
                preferences: {
                    readingPrefs: { fontScale: 1.15, weight: "regular", lineHeight: null },
                    portalFontScale: 1,
                },
            }),
        );

        render(<AccessibilityPreferencesSync />);
        await waitFor(() => expect(loadReadingPrefs().fontScale).toBe(1.15));

        // Só a chamada GET inicial — nenhum POST disparado pelo eco do save local.
        expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it("mudança local subsequente reenvia ao servidor após o debounce", async () => {
        mockAuthState.user = { id: "user-1" };
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ preferences: null }));

        render(<AccessibilityPreferencesSync />);
        // Sincronização inicial com preferences: null dispara GET + POST de semeadura.
        await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
        fetchSpy.mockClear();

        vi.useFakeTimers();
        act(() => {
            saveReadingPrefs({ fontScale: 1.6, weight: "bold", lineHeight: 1.9 });
        });

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(fetchSpy).toHaveBeenCalledWith(
            "/api/user/accessibility-preferences",
            expect.objectContaining({ method: "POST" }),
        );
        const sentBody = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
        expect(sentBody.readingPrefs.fontScale).toBe(1.6);
    });

    it("logout seguido de login do mesmo usuário (sem reload) refaz a sincronização inicial", async () => {
        mockAuthState.user = { id: "user-1" };
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ preferences: null }));

        const { rerender } = render(<AccessibilityPreferencesSync />);
        await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2)); // GET + POST de semeadura
        fetchSpy.mockClear();

        mockAuthState.user = null;
        rerender(<AccessibilityPreferencesSync />);
        expect(fetchSpy).not.toHaveBeenCalled();

        mockAuthState.user = { id: "user-1" };
        rerender(<AccessibilityPreferencesSync />);

        await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    });

    it("edição local feita antes do GET inicial resolver não é sobrescrita pelo valor (desatualizado) do servidor", async () => {
        mockAuthState.user = { id: "user-1" };

        let resolveGet!: (value: Response) => void;
        const getPromise = new Promise<Response>(resolve => {
            resolveGet = resolve;
        });
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation((...args: Parameters<typeof fetch>) => {
            const init = args[1];
            if (init?.method === "POST") return Promise.resolve(jsonResponse({}));
            return getPromise;
        });

        const { unmount } = render(<AccessibilityPreferencesSync />);

        // Usuário edita a tipografia ANTES do GET inicial responder.
        act(() => {
            saveReadingPrefs({ fontScale: 1.6, weight: "bold", lineHeight: 1.9 });
        });

        // GET resolve com um perfil de servidor desatualizado (não reflete a edição acima).
        await act(async () => {
            resolveGet(
                jsonResponse({
                    preferences: {
                        readingPrefs: { fontScale: 1, weight: "regular", lineHeight: null },
                        portalFontScale: 1,
                    },
                }),
            );
            await getPromise;
        });

        await waitFor(() => {
            expect(loadReadingPrefs().fontScale).toBe(1.6);
        });

        unmount();
        void fetchSpy;
    });

    it("troca de usuário (id diferente) sincroniza de novo para a nova conta", async () => {
        mockAuthState.user = { id: "user-1" };
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ preferences: null }));

        const { rerender } = render(<AccessibilityPreferencesSync />);
        await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
        fetchSpy.mockClear();

        mockAuthState.user = { id: "user-2" };
        rerender(<AccessibilityPreferencesSync />);

        await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    });
});
