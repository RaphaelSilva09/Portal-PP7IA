import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ViewIframe from "@/components/ViewIframe";

vi.mock("next-themes", () => ({
    useTheme: vi.fn(() => ({ resolvedTheme: "dark" })),
}));

class ResizeObserverMock {
    observe() {}
    disconnect() {}
}

describe("ViewIframe", () => {
    beforeEach(() => {
        vi.stubGlobal("ResizeObserver", ResizeObserverMock);
        vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
            callback(0);
            return 1;
        });
        vi.stubGlobal("cancelAnimationFrame", () => {});
    });

    it("mantém o src original do iframe", () => {
        render(<ViewIframe htmlPath="/api/proxy-html/newsletter/abc" title="Newsletter" />);

        const iframe = screen.getByTitle("Newsletter") as HTMLIFrameElement;
        expect(iframe.getAttribute("src")).toBe("/api/proxy-html/newsletter/abc");
    });

    it("sincroniza a altura com o conteúdo carregado", async () => {
        render(<ViewIframe htmlPath="/api/proxy-html/newsletter/abc" title="Newsletter" />);

        const iframe = screen.getByTitle("Newsletter") as HTMLIFrameElement;
        const mockDocument = {
            documentElement: {
                scrollHeight: 980,
                offsetHeight: 980,
                clientHeight: 980,
            },
            body: {
                scrollHeight: 960,
                offsetHeight: 960,
                clientHeight: 960,
            },
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        } as unknown as Document;
        const mockWindow = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        } as unknown as Window;

        Object.defineProperty(iframe, "contentDocument", {
            configurable: true,
            value: mockDocument,
        });
        Object.defineProperty(iframe, "contentWindow", {
            configurable: true,
            value: mockWindow,
        });

        fireEvent.load(iframe);

        await waitFor(() => {
            expect(iframe.style.height).toBe("984px");
        });
    });
});
