import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Ebook } from "@/domain/entities/Ebook";
import type { MiniLivro } from "@/domain/entities/MiniLivro";

vi.mock("@/presentation/hooks/useMiniLivros", () => ({
    useMiniLivros: vi.fn(),
}));

vi.mock("@/presentation/hooks/useEbook", () => ({
    useEbook: vi.fn(),
}));

vi.mock("@/presentation/hooks/useBook", () => ({
    useBook: vi.fn(() => ({ book: null, isLoading: false })),
}));

vi.mock("@/presentation/hooks/useScrollToHash", () => ({
    useScrollToHash: vi.fn(),
}));

vi.mock("next-themes", () => ({
    useTheme: vi.fn(() => ({ resolvedTheme: "light" })),
}));

import BentoGridMiniLivros from "@/components/BentoGridMiniLivros";
import { useEbook } from "@/presentation/hooks/useEbook";
import { useMiniLivros } from "@/presentation/hooks/useMiniLivros";

function makeMiniLivro(overrides: Partial<MiniLivro> = {}): MiniLivro {
    return {
        id: 101,
        title: "Mini-livro de teste",
        partOrder: 2,
        ebookId: null,
        htmlPath: "/view/mini-livro/teste",
        pdfPath: null,
        readTime: 5,
        createdAt: new Date("2026-04-07"),
        index: 1,
        htmlAvailable: true,
        pdfAvailable: false,
        formattedNumber: "001",
        formattedDate: "07/04/2026",
        toObject: () => ({}),
        ...overrides,
    } as unknown as MiniLivro;
}

function makeEbook(overrides: Partial<Ebook> = {}): Ebook {
    return {
        id: 202,
        title: "E-book Parte II",
        subtitle: null,
        description: null,
        coverImagePath: null,
        coverPdfPath: null,
        introHtmlPath: null,
        introPdfPath: null,
        badgeText: null,
        readTime: 10,
        createdAt: new Date("2026-04-07"),
        order: 2,
        htmlAvailable: false,
        coverPdfAvailable: false,
        introPdfAvailable: false,
        formattedNumber: "002",
        formattedDate: "07/04/2026",
        toObject: () => ({}),
        ...overrides,
    } as unknown as Ebook;
}

function mockData({ ebooks = [], miniLivros = [] }: { ebooks?: Ebook[]; miniLivros?: MiniLivro[] }) {
    vi.mocked(useMiniLivros).mockReturnValue({
        latest: null,
        older: [],
        all: miniLivros,
        isLoading: false,
        error: null,
        lastUpdated: null,
        refresh: vi.fn(),
    });

    vi.mocked(useEbook).mockReturnValue({
        latest: ebooks[0] ?? null,
        all: ebooks,
        isLoading: false,
        error: null,
        reload: vi.fn(),
    });
}

describe("BentoGridMiniLivros", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("mostra mini-livro da Parte II mesmo sem e-book cadastrado", () => {
        mockData({ miniLivros: [makeMiniLivro({ title: "Teste Parte II", partOrder: 2 })] });

        render(<BentoGridMiniLivros />);
        fireEvent.click(screen.getByRole("button", { name: "Parte II — A Coragem de Executar" }));

        expect(screen.getByText("Teste Parte II")).toBeTruthy();
        expect(screen.queryByText("Ainda estamos trabalhando por aqui. Volte em breve!")).toBeNull();
    });

    it("mostra e-book da Parte II sem mini-livros", () => {
        mockData({ ebooks: [makeEbook({ title: "A Coragem de Executar" })] });

        render(<BentoGridMiniLivros />);
        fireEvent.click(screen.getByRole("button", { name: /A Coragem de Executar/i }));

        expect(screen.getByRole("heading", { name: "A Coragem de Executar" })).toBeTruthy();
    });

    it("mostra e-book e mini-livro quando ambos existem na mesma parte", () => {
        mockData({
            ebooks: [makeEbook({ title: "A Coragem de Executar" })],
            miniLivros: [makeMiniLivro({ title: "Capítulo Parte II", partOrder: 2 })],
        });

        render(<BentoGridMiniLivros />);
        fireEvent.click(screen.getByRole("button", { name: /A Coragem de Executar/i }));

        expect(screen.getByRole("heading", { name: "A Coragem de Executar" })).toBeTruthy();
        expect(screen.getByText("Capítulo Parte II")).toBeTruthy();
    });

    it("mostra placeholder quando a Parte III não tem e-book nem mini-livro", () => {
        mockData({});

        render(<BentoGridMiniLivros />);
        fireEvent.click(screen.getByRole("button", { name: /Parte III/i }));

        expect(screen.getByText("Ainda estamos trabalhando por aqui. Volte em breve!")).toBeTruthy();
    });
});
