import { describe, expect, it, vi } from "vitest";
import { EvaluateContentAccessUseCase } from "@/application/usecases/EvaluateContentAccessUseCase";
import type { IContentAccessRuleRepository } from "@/domain/repositories/IContentAccessRuleRepository";
import type { ContentAccessRule } from "@/domain/entities/ContentAccessRule";
import { REQUIRES_LOGIN_RULE_TYPE } from "@/domain/access-rules/strategies/requiresLogin";

function fakeRepository(rule: ContentAccessRule | null): IContentAccessRuleRepository {
    return {
        getRule: vi.fn().mockResolvedValue(rule),
        getRulesForSlugs: vi.fn(),
        upsert: vi.fn(),
        remove: vi.fn(),
    };
}

function makeRule(overrides: Partial<ContentAccessRule> = {}): ContentAccessRule {
    return {
        contentType: "newsletter",
        slug: "pp-news-42",
        ruleType: REQUIRES_LOGIN_RULE_TYPE,
        params: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

describe("EvaluateContentAccessUseCase", () => {
    it("sem regra salva, libera qualquer um (inclusive deslogado)", async () => {
        const useCase = new EvaluateContentAccessUseCase(fakeRepository(null));
        const result = await useCase.execute({ contentType: "newsletter", slug: "x", userId: null, role: null });
        expect(result).toEqual({ allowed: true });
    });

    it("com regra requires_login, bloqueia usuário deslogado e devolve o DTO da strategy", async () => {
        const useCase = new EvaluateContentAccessUseCase(fakeRepository(makeRule()));
        const result = await useCase.execute({ contentType: "newsletter", slug: "pp-news-42", userId: null, role: null });

        expect(result.allowed).toBe(false);
        if (!result.allowed) {
            expect(result.view.ruleType).toBe(REQUIRES_LOGIN_RULE_TYPE);
            expect(result.view.icon).toBe("lock");
        }
    });

    it("com regra requires_login, libera usuário logado", async () => {
        const useCase = new EvaluateContentAccessUseCase(fakeRepository(makeRule()));
        const result = await useCase.execute({ contentType: "newsletter", slug: "pp-news-42", userId: "user-1", role: null });
        expect(result).toEqual({ allowed: true });
    });

    it("regra com ruleType desconhecido falha fechado (bloqueia), não expõe o conteúdo", async () => {
        const useCase = new EvaluateContentAccessUseCase(fakeRepository(makeRule({ ruleType: "tipo_removido_do_registry" })));
        const result = await useCase.execute({ contentType: "newsletter", slug: "pp-news-42", userId: "user-1", role: null });

        expect(result.allowed).toBe(false);
        if (!result.allowed) {
            expect(result.view.unlockAction).toEqual({ kind: "retry" });
        }
    });
});
