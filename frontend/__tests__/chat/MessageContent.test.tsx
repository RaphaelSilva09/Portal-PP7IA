import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageContent } from "@/components/chat/MessageContent";
import type { Citation } from "@/domain/chat/RagAnswer";

const cites: Citation[] = [
    { slug: "001", title: "ML 1", heading_path: ["Enquanto é Tempo", "Cap I"], similarity: 0.9 },
    { slug: "002", title: "ML 2", heading_path: ["Enquanto é Tempo", "Cap II"], similarity: 0.8 },
];

describe("MessageContent", () => {
    it("renders [N] as anchor with correct href and target", () => {
        const { container } = render(<MessageContent content="Veja aqui [1]." citations={cites} />);
        const link = screen.getByRole("link", { name: "[1]" });
        expect(link.getAttribute("href")).toBe("/view/mini-livro/001#cap-i");
        expect(link.getAttribute("target")).toBe("_blank");
        expect(link.getAttribute("rel")).toBe("noopener noreferrer");
        expect(container.textContent).toBe("Veja aqui [1].");
    });

    it("renders [1][2] as two separate anchors", () => {
        render(<MessageContent content="Combina [1][2] tudo." citations={cites} />);
        const links = screen.getAllByRole("link");
        expect(links).toHaveLength(2);
        expect(links[0].textContent).toBe("[1]");
        expect(links[1].textContent).toBe("[2]");
        expect(links[0].getAttribute("href")).toBe("/view/mini-livro/001#cap-i");
        expect(links[1].getAttribute("href")).toBe("/view/mini-livro/002#cap-ii");
    });

    it("renders [N] out of range as plain text", () => {
        const { container } = render(<MessageContent content="Falso [9] ref." citations={cites} />);
        expect(screen.queryAllByRole("link")).toHaveLength(0);
        expect(container.textContent).toBe("Falso [9] ref.");
    });

    it("renders text without markers unchanged", () => {
        const { container } = render(<MessageContent content="Sem refs aqui." citations={cites} />);
        expect(screen.queryAllByRole("link")).toHaveLength(0);
        expect(container.textContent).toBe("Sem refs aqui.");
    });
});
