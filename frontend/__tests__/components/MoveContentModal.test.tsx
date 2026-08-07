import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MoveContentModal } from "@/components/admin/MoveContentModal";
import { ContentItem } from "@/domain/entities/ContentItem";

const { mockUseEbook } = vi.hoisted(() => ({ mockUseEbook: vi.fn() }));
vi.mock("@/presentation/hooks/useEbook", () => ({ useEbook: mockUseEbook }));

function makeItem(overrides: Partial<Parameters<typeof ContentItem.create>[0]> = {}) {
    return ContentItem.create({
        id: 7,
        createdAt: new Date("2026-03-10T00:00:00.000Z"),
        title: "Guia de IA",
        htmlPath: "/materiais/radar-de-oportunidades/007.html",
        pdfPath: null,
        readTime: 5,
        ...overrides,
    });
}

describe("MoveContentModal", () => {
    const onMove = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        onMove.mockResolvedValue(undefined);
        mockUseEbook.mockReturnValue({
            all: [{ id: 1, order: 1, title: "Liderança Híbrida" }],
            latest: null,
            isLoading: false,
            error: null,
            reload: vi.fn(),
        });
    });

    it("mostra o select de Tema ao escolher Biblioteca como destino", () => {
        render(
            <MoveContentModal isOpen item={makeItem()} sourceType="radar_oportunidades" onMove={onMove} onCancel={onCancel} />,
        );

        fireEvent.change(screen.getByLabelText(/mover para/i), { target: { value: "biblioteca" } });

        expect(screen.getByText("Tema *")).toBeTruthy();
    });

    it("desabilita a opção Mini-livro quando não há e-books cadastrados", () => {
        mockUseEbook.mockReturnValue({ all: [], latest: null, isLoading: false, error: null, reload: vi.fn() });

        render(
            <MoveContentModal isOpen item={makeItem()} sourceType="radar_oportunidades" onMove={onMove} onCancel={onCancel} />,
        );

        const option = screen.getByRole("option", {
            name: /mini-livros \(crie um e-book primeiro\)/i,
        }) as HTMLOptionElement;
        expect(option.disabled).toBe(true);
    });

    it("pede confirmação antes de mover algo com Tema para um bloco sem Tema", async () => {
        render(
            <MoveContentModal
                isOpen
                item={makeItem({ tema: "tecnologia" })}
                sourceType="biblioteca"
                onMove={onMove}
                onCancel={onCancel}
            />,
        );

        fireEvent.change(screen.getByLabelText(/mover para/i), { target: { value: "estudar" } });
        fireEvent.click(screen.getByRole("button", { name: "Mover" }));

        expect(await screen.findByText(/vai remover/i)).toBeTruthy();
        expect(onMove).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "Mover mesmo assim" }));

        await waitFor(() =>
            expect(onMove).toHaveBeenCalledWith({
                targetType: "estudar",
                tema: undefined,
                ebookId: undefined,
                partOrder: undefined,
            }),
        );
    });

    it("move direto, sem aviso, quando não há perda de campo", async () => {
        render(
            <MoveContentModal isOpen item={makeItem()} sourceType="radar_oportunidades" onMove={onMove} onCancel={onCancel} />,
        );

        fireEvent.change(screen.getByLabelText(/mover para/i), { target: { value: "estudar" } });
        fireEvent.click(screen.getByRole("button", { name: "Mover" }));

        await waitFor(() =>
            expect(onMove).toHaveBeenCalledWith({
                targetType: "estudar",
                tema: undefined,
                ebookId: undefined,
                partOrder: undefined,
            }),
        );
        expect(screen.queryByText(/vai remover/i)).toBeNull();
    });

    it("preenche ebookId e partOrder a partir do e-book escolhido para Mini-livro", async () => {
        render(
            <MoveContentModal isOpen item={makeItem()} sourceType="radar_oportunidades" onMove={onMove} onCancel={onCancel} />,
        );

        fireEvent.change(screen.getByLabelText(/mover para/i), { target: { value: "mini-livro" } });
        fireEvent.change(screen.getByLabelText(/e-book/i), { target: { value: "1" } });
        fireEvent.click(screen.getByRole("button", { name: "Mover" }));

        await waitFor(() =>
            expect(onMove).toHaveBeenCalledWith({
                targetType: "mini-livro",
                tema: undefined,
                ebookId: 1,
                partOrder: 1,
            }),
        );
    });
});
