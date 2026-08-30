import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccessStatusBadge } from "@/components/admin/ContentTable";
import { ContentItem } from "@/domain/entities/ContentItem";
import type { AccessRuleView } from "@/domain/access-rules/AccessRuleView";

const lockedView: AccessRuleView = {
    ruleType: "requires_login",
    icon: "lock",
    cardLabel: "Faça login para acessar",
    modalTitle: "x",
    modalMessage: "x",
    unlockButtonLabel: "x",
    unlockAction: { kind: "open-auth-modal", mode: "login" },
};

function baseItem(accessRule: AccessRuleView | null): ContentItem {
    return ContentItem.create({
        id: 1,
        createdAt: new Date(),
        title: "PP-News #42",
        htmlPath: "materiais/newsletters/pp-news-42.html",
        pdfPath: null,
        readTime: 5,
        accessRule,
    });
}

describe("AccessStatusBadge", () => {
    it("mostra 'Bloqueado' quando o item tem accessRule", () => {
        render(<AccessStatusBadge item={baseItem(lockedView)} />);
        expect(screen.getByText("Bloqueado")).toBeTruthy();
    });

    it("mostra 'Livre' quando o item não tem accessRule", () => {
        render(<AccessStatusBadge item={baseItem(null)} />);
        expect(screen.getByText("Livre")).toBeTruthy();
    });
});
