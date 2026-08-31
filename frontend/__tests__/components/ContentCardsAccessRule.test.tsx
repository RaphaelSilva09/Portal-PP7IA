import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/SaveForLaterButton", () => ({ default: () => null }));
vi.mock("@/components/UpdatedBadge", () => ({ default: () => null }));
vi.mock("@/components/UnlockActionButton", () => ({
    default: ({ view }: { view: { unlockButtonLabel: string } }) => <button>{view.unlockButtonLabel}</button>,
}));

const { mockOpenModal } = vi.hoisted(() => ({ mockOpenModal: vi.fn() }));
vi.mock("@/context/ContentLockedModalContext", () => ({
    useContentLockedModal: () => ({ isOpen: false, view: null, openModal: mockOpenModal, closeModal: vi.fn() }),
}));

import { ItemCard, FeaturedCard, BLOCK_CARD_CONFIG, type Item } from "@/components/explorar/ContentCards";
import type { AccessRuleView } from "@/domain/access-rules/AccessRuleView";

const lockedView: AccessRuleView = {
    ruleType: "requires_login",
    icon: "lock",
    cardLabel: "Faça login para acessar",
    modalTitle: "Conteúdo exclusivo para leitores",
    modalMessage: "x",
    unlockButtonLabel: "Fazer login",
    unlockAction: { kind: "open-auth-modal", mode: "login" },
};

function baseItem(overrides: Partial<Item> = {}): Item {
    return {
        id: 1,
        title: "PP-News #42",
        htmlPath: "/view/newsletter/pp-news-42",
        pdfPath: null,
        htmlAvailable: true,
        pdfAvailable: false,
        formattedDate: "08/08/2026",
        formattedNumber: "042",
        ...overrides,
    };
}

describe("ItemCard — conteúdo bloqueado", () => {
    it("sem accessRule, o título é um link normal", () => {
        render(<ItemCard item={baseItem()} block={BLOCK_CARD_CONFIG.newsletter} contentType="newsletter" />);
        expect(screen.getByRole("link", { name: /PP-News #42/ })).toBeTruthy();
    });

    it("com accessRule, o título vira um botão (não navega) e mostra o selo de bloqueio", () => {
        render(
            <ItemCard
                item={baseItem({ accessRule: lockedView })}
                block={BLOCK_CARD_CONFIG.newsletter}
                contentType="newsletter"
            />,
        );

        expect(screen.queryByRole("link", { name: /PP-News #42/ })).toBeNull();
        expect(screen.getByRole("button", { name: /PP-News #42/ })).toBeTruthy();
        expect(screen.getByText(lockedView.cardLabel)).toBeTruthy();
    });

    it("clicar no título bloqueado abre o pop-up (via ContentLockedModalContext), não navega", () => {
        render(
            <ItemCard
                item={baseItem({ accessRule: lockedView })}
                block={BLOCK_CARD_CONFIG.newsletter}
                contentType="newsletter"
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /PP-News #42/ }));

        expect(mockOpenModal).toHaveBeenCalledWith(lockedView);
    });
});

describe("FeaturedCard — conteúdo bloqueado", () => {
    it("com accessRule, não mostra o botão 'Ler agora' (navegaria direto), mostra a ação de desbloqueio", () => {
        render(
            <FeaturedCard
                item={baseItem({ accessRule: lockedView })}
                block={BLOCK_CARD_CONFIG.newsletter}
                contentType="newsletter"
            />,
        );

        expect(screen.queryByRole("link", { name: /Ler agora/ })).toBeNull();
        expect(screen.getByRole("button", { name: lockedView.unlockButtonLabel })).toBeTruthy();
    });

    it("sem accessRule, mostra 'Ler agora' normalmente", () => {
        render(
            <FeaturedCard item={baseItem()} block={BLOCK_CARD_CONFIG.newsletter} contentType="newsletter" />,
        );

        expect(screen.getByRole("link", { name: /Ler agora/ })).toBeTruthy();
    });
});
