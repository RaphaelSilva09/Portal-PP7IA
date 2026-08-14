import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuthState } = vi.hoisted(() => ({
    mockAuthState: { user: { id: "user-1", email: "teste@teste.com" } as unknown },
}));

vi.mock("@/context/AuthContext", () => ({
    useAuth: vi.fn(() => mockAuthState),
}));

vi.mock("next/navigation", () => ({
    usePathname: vi.fn(() => "/view/newsletter/011"),
}));

import ContentViewTracker from "@/components/ContentViewTracker";

function renderWithClient(ui: React.ReactElement) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    const utils = render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
    return { ...utils, invalidateSpy };
}

describe("ContentViewTracker — reading trail progress", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        mockAuthState.user = { id: "user-1", email: "teste@teste.com" };
        window.localStorage.clear();
    });

    it("invalidates the cached reading-trail query right after a successful progress POST", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
        const { invalidateSpy } = renderWithClient(
            <ContentViewTracker contentType="newsletter" title="PP-News #07" contentId="011" />,
        );

        await waitFor(() => {
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["reading-trail"] });
        });
    });

    it("does not invalidate when the progress POST fails (content not in any trail, or a real error)", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ error: "boom" }), { status: 500 }));
        const { invalidateSpy } = renderWithClient(
            <ContentViewTracker contentType="newsletter" title="PP-News #07" contentId="011" />,
        );

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalled();
        });
        expect(invalidateSpy).not.toHaveBeenCalled();
    });

    it("does not call the progress endpoint at all without a logged-in user", async () => {
        mockAuthState.user = null;
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
        renderWithClient(<ContentViewTracker contentType="newsletter" title="PP-News #07" contentId="011" />);

        await new Promise(r => setTimeout(r, 10));
        expect(fetchSpy).not.toHaveBeenCalledWith("/api/reading-trails/progress", expect.anything());
    });
});
