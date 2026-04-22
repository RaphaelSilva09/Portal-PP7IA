import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import ViewContentNavigation from "@/components/ViewContentNavigation";

vi.mock("next/link", () => ({
    default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe("ViewContentNavigation", () => {
    it("não renderiza nada quando não há navegação", () => {
        const { container } = render(<ViewContentNavigation previous={null} next={null} />);

        expect(container.firstChild).toBeNull();
    });

    it("renderiza apenas o botão de próximo quando só ele existe", () => {
        render(
            <ViewContentNavigation
                previous={null}
                next={{ id: 2, title: "Próximo conteúdo", href: "/view/newsletter/proximo", slug: "proximo" }}
            />,
        );

        expect(screen.getByRole("link", { name: /ir para o próximo/i })).toBeTruthy();
        expect(screen.queryByRole("link", { name: /ir para o anterior/i })).toBeNull();
    });

    it("renderiza os dois botões quando há anterior e próximo", () => {
        render(
            <ViewContentNavigation
                previous={{ id: 1, title: "Conteúdo anterior", href: "/view/newsletter/anterior", slug: "anterior" }}
                next={{ id: 3, title: "Conteúdo seguinte", href: "/view/newsletter/seguinte", slug: "seguinte" }}
            />,
        );

        expect(screen.getByRole("link", { name: /ir para o anterior/i })).toBeTruthy();
        expect(screen.getByRole("link", { name: /ir para o próximo/i })).toBeTruthy();
    });
});
