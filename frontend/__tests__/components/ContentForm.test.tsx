import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ContentForm } from "@/components/admin/ContentForm";

const noopSubmit = vi.fn();
const noopCancel = vi.fn();

describe("ContentForm editorial guidance", () => {
    it("uses the IA public label and simple editorial guidance", () => {
        render(
            <ContentForm
                type="especial-semana"
                onSubmit={noopSubmit}
                onCancel={noopCancel}
            />,
        );

        expect(screen.getByRole("heading", { name: "Inteligência Artificial" })).toBeTruthy();
        expect(screen.getByText(/IA importantes para o Brasil/i)).toBeTruthy();
    });

    it("uses the editorials label and short-content guidance", () => {
        render(
            <ContentForm
                type="radar_oportunidades"
                onSubmit={noopSubmit}
                onCancel={noopCancel}
            />,
        );

        expect(screen.getByRole("heading", { name: "Editoriais e Artigos" })).toBeTruthy();
        expect(screen.getByText(/3 a 4 textos/i)).toBeTruthy();
    });

    it("reminds admins of the twice-weekly newsletter cadence", () => {
        render(
            <ContentForm
                type="newsletter"
                onSubmit={noopSubmit}
                onCancel={noopCancel}
            />,
        );

        expect(screen.getByText(/2 edições por semana com 7 notícias/i)).toBeTruthy();
    });
});
