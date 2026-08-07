import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SortableContentTable } from "@/components/admin/SortableContentTable";
import { ContentItem } from "@/domain/entities/ContentItem";

function makeItem() {
    return ContentItem.create({
        id: 7,
        createdAt: new Date(),
        title: "Guia de IA",
        htmlPath: "/materiais/radar-de-oportunidades/007.html",
        pdfPath: null,
        readTime: 5,
        index: 1,
    });
}

describe("SortableContentTable", () => {
    it("chama onMove com o item ao clicar no botão de mover", () => {
        const onMove = vi.fn();
        render(
            <SortableContentTable
                items={[makeItem()]}
                onEdit={vi.fn()}
                onMove={onMove}
                onDelete={vi.fn()}
                onReorder={vi.fn()}
                type="radar_oportunidades"
            />,
        );

        fireEvent.click(screen.getByLabelText("Mover para outro bloco"));

        expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }));
    });
});
