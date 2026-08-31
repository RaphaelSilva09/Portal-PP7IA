import { describe, expect, it } from "vitest";
import { requiresLoginStrategy, REQUIRES_LOGIN_RULE_TYPE } from "@/domain/access-rules/strategies/requiresLogin";
import { getAccessRuleStrategy, listAccessRuleStrategies } from "@/domain/access-rules/registry";

describe("requiresLoginStrategy", () => {
    it("bloqueia usuário deslogado (userId null)", () => {
        expect(requiresLoginStrategy.evaluate({ userId: null, role: null }, {})).toBe(false);
    });

    it("libera usuário logado", () => {
        expect(requiresLoginStrategy.evaluate({ userId: "user-1", role: null }, {})).toBe(true);
    });

    it("describe() devolve ícone de cadeado e ação de abrir o login", () => {
        const view = requiresLoginStrategy.describe({});
        expect(view.icon).toBe("lock");
        expect(view.ruleType).toBe(REQUIRES_LOGIN_RULE_TYPE);
        expect(view.unlockAction).toEqual({ kind: "open-auth-modal", mode: "login" });
        expect(view.cardLabel.length).toBeGreaterThan(0);
        expect(view.modalTitle.length).toBeGreaterThan(0);
        expect(view.modalMessage.length).toBeGreaterThan(0);
    });
});

describe("registry", () => {
    it("resolve requiresLoginStrategy pelo type", () => {
        expect(getAccessRuleStrategy(REQUIRES_LOGIN_RULE_TYPE)).toBe(requiresLoginStrategy);
    });

    it("devolve null para um tipo desconhecido", () => {
        expect(getAccessRuleStrategy("nao_existe")).toBeNull();
    });

    it("lista todas as strategies registradas, incluindo requiresLogin", () => {
        const types = listAccessRuleStrategies().map(s => s.type);
        expect(types).toContain(REQUIRES_LOGIN_RULE_TYPE);
    });
});
