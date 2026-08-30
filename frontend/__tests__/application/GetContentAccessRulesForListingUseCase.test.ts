import { describe, expect, it, vi } from "vitest";
import { GetContentAccessRulesForListingUseCase } from "@/application/usecases/GetContentAccessRulesForListingUseCase";
import type { IContentAccessRuleRepository } from "@/domain/repositories/IContentAccessRuleRepository";
import type { ContentAccessRule } from "@/domain/entities/ContentAccessRule";
import { REQUIRES_LOGIN_RULE_TYPE } from "@/domain/access-rules/strategies/requiresLogin";

const ANONYMOUS = { userId: null, role: null };
const LOGGED_IN = { userId: "user-1", role: "user" };
const ADMIN = { userId: "admin-1", role: "admin" };

function fakeRepository(rules: ContentAccessRule[]): IContentAccessRuleRepository {
    return {
        getRule: vi.fn(),
        getRulesForSlugs: vi.fn().mockResolvedValue(rules),
        upsert: vi.fn(),
        remove: vi.fn(),
    };
}

function makeRule(overrides: Partial<ContentAccessRule> = {}): ContentAccessRule {
    return {
        contentType: "newsletter",
        slug: "a",
        ruleType: REQUIRES_LOGIN_RULE_TYPE,
        params: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

describe("GetContentAccessRulesForListingUseCase", () => {
    it("leitor anônimo: devolve a regra (não passa em requires_login)", async () => {
        const repo = fakeRepository([makeRule({ slug: "a" }), makeRule({ slug: "b" })]);
        const useCase = new GetContentAccessRulesForListingUseCase(repo);

        const result = await useCase.execute("newsletter", ["a", "b", "c"], ANONYMOUS);

        expect(result.size).toBe(2);
        expect(result.get("a")?.ruleType).toBe(REQUIRES_LOGIN_RULE_TYPE);
        expect(result.get("b")?.ruleType).toBe(REQUIRES_LOGIN_RULE_TYPE);
        expect(result.has("c")).toBe(false);
    });

    it("leitor logado: NÃO devolve a regra requires_login, porque ele já passa nela (bug reportado: conteúdo aparecia bloqueado mesmo logado)", async () => {
        const repo = fakeRepository([makeRule({ slug: "a" })]);
        const useCase = new GetContentAccessRulesForListingUseCase(repo);

        const result = await useCase.execute("newsletter", ["a"], LOGGED_IN);

        expect(result.size).toBe(0);
    });

    it("admin (sem unfiltered): também não vê a regra, já que também está logado", async () => {
        const repo = fakeRepository([makeRule({ slug: "a" })]);
        const useCase = new GetContentAccessRulesForListingUseCase(repo);

        const result = await useCase.execute("newsletter", ["a"], ADMIN);

        expect(result.size).toBe(0);
    });

    it("admin com unfiltered: vê a regra mesmo passando nela — visão de gerenciamento, não de leitura", async () => {
        const repo = fakeRepository([makeRule({ slug: "a" })]);
        const useCase = new GetContentAccessRulesForListingUseCase(repo);

        const result = await useCase.execute("newsletter", ["a"], ADMIN, { unfiltered: true });

        expect(result.size).toBe(1);
        expect(result.get("a")?.ruleType).toBe(REQUIRES_LOGIN_RULE_TYPE);
    });

    it("omite regras com ruleType desconhecido em vez de falhar a listagem inteira", async () => {
        const repo = fakeRepository([makeRule({ slug: "a", ruleType: "tipo_desconhecido" })]);
        const useCase = new GetContentAccessRulesForListingUseCase(repo);

        const result = await useCase.execute("newsletter", ["a"], ANONYMOUS);

        expect(result.size).toBe(0);
    });

    it("mapa vazio quando não há regras", async () => {
        const repo = fakeRepository([]);
        const useCase = new GetContentAccessRulesForListingUseCase(repo);

        const result = await useCase.execute("newsletter", ["a", "b"], ANONYMOUS);

        expect(result.size).toBe(0);
    });
});
