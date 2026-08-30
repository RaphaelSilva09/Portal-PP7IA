import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ViewContentFrame puxa vários componentes pesados (header, chat, reações,
// etc.) que não são o alvo deste teste — trocados por stubs mínimos para
// isolar o comportamento do estado "locked" que esta feature adicionou.
vi.mock("@/components/chat/ChatBubble", () => ({ default: () => null }));
vi.mock("@/components/ContentReactions", () => ({ default: () => null }));
vi.mock("@/components/ContentViewTracker", () => ({ default: () => null }));
vi.mock("@/components/ExportPdfButton", () => ({ default: () => null }));
vi.mock("@/components/Header", () => ({ default: () => <div data-testid="navbar-stub">Navbar</div> }));
vi.mock("@/components/ReadingPrefsControl", () => ({ default: () => null }));
vi.mock("@/components/SaveForLaterButton", () => ({ default: () => null }));
vi.mock("@/components/ShareButton", () => ({ default: () => null }));
vi.mock("@/components/TrailStepNavigation", () => ({ default: () => null }));
vi.mock("@/components/ViewContentNavigation", () => ({ default: () => null }));
vi.mock("@/components/ViewIframe", () => ({ default: () => <div data-testid="iframe-stub">iframe</div> }));
vi.mock("@/context/AuthModalContext", () => ({ useAuthModal: () => ({ openModal: vi.fn() }) }));

import ViewContentFrame from "@/components/ViewContentFrame";
import type { AccessRuleView } from "@/domain/access-rules/AccessRuleView";

const lockedView: AccessRuleView = {
    ruleType: "requires_login",
    icon: "lock",
    cardLabel: "Faça login para acessar",
    modalTitle: "Conteúdo exclusivo para leitores",
    modalMessage: "Este conteúdo só pode ser acessado por quem tem uma conta no portal.",
    unlockButtonLabel: "Fazer login",
    unlockAction: { kind: "open-auth-modal", mode: "login" },
};

function jsonResponse(body: unknown, status = 200, headers?: Record<string, string>): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        headers: new Headers(headers),
        json: vi.fn().mockResolvedValue(body),
    } as unknown as Response;
}

function baseProps() {
    return {
        htmlPath: "/api/proxy-html/newsletter/pp-news-42",
        title: "PP-News #42",
        previous: null,
        next: null,
        contentType: "newsletter",
        slug: "pp-news-42",
        sectionLabel: "Newsletter",
        backHref: "/explorar?b=newsletter",
    };
}

describe("ViewContentFrame — estado locked", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    beforeEach(() => {
        vi.spyOn(globalThis, "fetch");
    });

    it("com initialLockInfo, nasce direto na tela de bloqueio, sem chamar o probe HEAD", async () => {
        render(<ViewContentFrame {...baseProps()} initialLockInfo={lockedView} />);

        expect(await globalThis.document.body.textContent).toContain(lockedView.modalTitle);
        expect(globalThis.fetch).not.toHaveBeenCalled();
        // Header continua visível na tela de bloqueio, como o pedido exige.
        expect(document.querySelector('[data-testid="navbar-stub"]')).not.toBeNull();
    });

    it("sem initialLockInfo, um 403 no probe HEAD (acesso direto à URL) também mostra a tela de bloqueio, com o DTO do header X-Access-Rule", async () => {
        vi.mocked(globalThis.fetch).mockResolvedValue(
            jsonResponse(null, 403, { "X-Access-Rule": encodeURIComponent(JSON.stringify(lockedView)) }),
        );

        render(<ViewContentFrame {...baseProps()} />);

        await waitFor(() => {
            expect(document.body.textContent).toContain(lockedView.modalTitle);
        });
    });

    it("sem bloqueio, o probe HEAD ok renderiza o iframe normalmente", async () => {
        vi.mocked(globalThis.fetch).mockResolvedValue(jsonResponse(null, 200));

        render(<ViewContentFrame {...baseProps()} />);

        await waitFor(() => {
            expect(document.querySelector('[data-testid="iframe-stub"]')).not.toBeNull();
        });
    });
});
