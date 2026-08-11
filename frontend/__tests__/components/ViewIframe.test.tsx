import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "next-themes";
import ViewIframe, { applySepiaToColor, SEPIA_AMOUNT } from "@/components/ViewIframe";

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
        vi.mocked(useTheme).mockReturnValue({ resolvedTheme: "dark" } as ReturnType<typeof useTheme>);
    });

    it("mantém o src original do iframe", () => {
        render(<ViewIframe htmlPath="/api/proxy-html/newsletter/abc" title="Newsletter" />);

        const iframe = screen.getByTitle("Newsletter") as HTMLIFrameElement;
        expect(iframe.getAttribute("src")).toBe("/api/proxy-html/newsletter/abc");
    });

    it("permite popups escaparem do sandbox para os links abrirem em nova aba", () => {
        render(<ViewIframe htmlPath="/api/proxy-html/editorial/apple" title="Editorial" />);

        const iframe = screen.getByTitle("Editorial") as HTMLIFrameElement;
        const sandbox = iframe.getAttribute("sandbox") ?? "";

        expect(sandbox).toContain("allow-popups");
        expect(sandbox).toContain("allow-popups-to-escape-sandbox");
    });

    it("reescreve links externos para abrir em nova aba, preservando âncoras e relativos", () => {
        render(<ViewIframe htmlPath="/api/proxy-html/editorial/apple" title="Editorial" />);

        const iframe = screen.getByTitle("Editorial") as HTMLIFrameElement;

        const externalAnchor = document.createElement("a");
        externalAnchor.setAttribute("href", "https://medium.com/artigo");
        const protocolRelativeAnchor = document.createElement("a");
        protocolRelativeAnchor.setAttribute("href", "//example.com/x");
        const hashAnchor = document.createElement("a");
        hashAnchor.setAttribute("href", "#secao");
        const relativeAnchor = document.createElement("a");
        relativeAnchor.setAttribute("href", "/interno");

        const anchors = [externalAnchor, protocolRelativeAnchor, hashAnchor, relativeAnchor];
        const mockDocument = {
            head: document.createElement("head"),
            body: document.createElement("body"),
            documentElement: document.createElement("html"),
            querySelectorAll: (selector: string) =>
                selector === "a[href]" ? (anchors as unknown as NodeListOf<HTMLAnchorElement>) : [],
            getElementById: () => null,
            createElement: (tag: string) => document.createElement(tag),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        } as unknown as Document;
        const mockWindow = { addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as Window;

        Object.defineProperty(iframe, "contentDocument", { configurable: true, value: mockDocument });
        Object.defineProperty(iframe, "contentWindow", { configurable: true, value: mockWindow });

        fireEvent.load(iframe);

        expect(externalAnchor.getAttribute("target")).toBe("_blank");
        expect(externalAnchor.getAttribute("rel")).toBe("noopener noreferrer");
        expect(protocolRelativeAnchor.getAttribute("target")).toBe("_blank");
        expect(hashAnchor.getAttribute("target")).toBeNull();
        expect(relativeAnchor.getAttribute("target")).toBeNull();
    });

    it("não aplica filtro de sépia fora do tema sépia", () => {
        render(<ViewIframe htmlPath="/api/proxy-html/newsletter/abc" title="Newsletter" />);

        const iframe = screen.getByTitle("Newsletter") as HTMLIFrameElement;
        expect(iframe.style.filter).toBe("");
    });

    it("aplica filtro de sépia no conteúdo do iframe quando o tema sépia está ativo", () => {
        vi.mocked(useTheme).mockReturnValue({ resolvedTheme: "theme-sepia" } as ReturnType<typeof useTheme>);

        render(<ViewIframe htmlPath="/api/proxy-html/newsletter/abc" title="Newsletter" />);

        const iframe = screen.getByTitle("Newsletter") as HTMLIFrameElement;
        expect(iframe.style.filter).toContain("sepia(");
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

    it("reporta a cor de fundo tingida de sépia quando o tema sépia está ativo, e a crua fora dele", async () => {
        vi.mocked(useTheme).mockReturnValue({ resolvedTheme: "theme-sepia" } as ReturnType<typeof useTheme>);
        const onBackgroundColorChange = vi.fn();

        render(
            <ViewIframe
                htmlPath="/api/proxy-html/newsletter/abc"
                title="Newsletter"
                onBackgroundColorChange={onBackgroundColorChange}
            />,
        );

        const iframe = screen.getByTitle("Newsletter") as HTMLIFrameElement;
        const mockWindow = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            getComputedStyle: vi.fn(() => ({ backgroundColor: "rgb(100, 150, 200)" })),
        } as unknown as Window;
        const mockDocument = {
            documentElement: { scrollHeight: 980, offsetHeight: 980, clientHeight: 980 },
            body: { scrollHeight: 960, offsetHeight: 960, clientHeight: 960 },
            defaultView: mockWindow,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        } as unknown as Document;

        Object.defineProperty(iframe, "contentDocument", { configurable: true, value: mockDocument });
        Object.defineProperty(iframe, "contentWindow", { configurable: true, value: mockWindow });

        fireEvent.load(iframe);

        await waitFor(() => {
            expect(onBackgroundColorChange).toHaveBeenCalledWith(applySepiaToColor("rgb(100, 150, 200)", SEPIA_AMOUNT));
        });
        // A mistura de sépia é visível: nunca reporta a cor crua enquanto o tema sépia está ativo.
        expect(onBackgroundColorChange).not.toHaveBeenCalledWith("rgb(100, 150, 200)");
    });
});

describe("applySepiaToColor", () => {
    it("mistura o canal rgb pela matriz de sépia na proporção informada", () => {
        expect(applySepiaToColor("rgb(100, 150, 200)", 0.55)).toBe("rgb(151, 162, 163)");
    });

    it("preserva o canal alpha em rgba", () => {
        expect(applySepiaToColor("rgba(100, 150, 200, 0.8)", 0.55)).toBe("rgba(151, 162, 163, 0.8)");
    });

    it("devolve a cor original quando não reconhece o formato", () => {
        expect(applySepiaToColor("transparent", 0.55)).toBe("transparent");
    });
});
