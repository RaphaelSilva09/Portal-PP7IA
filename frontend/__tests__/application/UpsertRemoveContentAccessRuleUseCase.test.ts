import { describe, expect, it, vi } from "vitest";
import { UpsertContentAccessRuleUseCase } from "@/application/usecases/UpsertContentAccessRuleUseCase";
import { RemoveContentAccessRuleUseCase } from "@/application/usecases/RemoveContentAccessRuleUseCase";
import type { IContentAccessRuleRepository } from "@/domain/repositories/IContentAccessRuleRepository";
import { REQUIRES_LOGIN_RULE_TYPE } from "@/domain/access-rules/strategies/requiresLogin";

function fakeRepository(): IContentAccessRuleRepository {
    return {
        getRule: vi.fn(),
        getRulesForSlugs: vi.fn(),
        upsert: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn().mockResolvedValue(undefined),
    };
}

describe("UpsertContentAccessRuleUseCase", () => {
    it("grava a regra quando o ruleType existe no registry", async () => {
        const repo = fakeRepository();
        const useCase = new UpsertContentAccessRuleUseCase(repo);

        await useCase.execute({ contentType: "newsletter", slug: "pp-news-42", ruleType: REQUIRES_LOGIN_RULE_TYPE, params: {} });

        expect(repo.upsert).toHaveBeenCalledWith("newsletter", "pp-news-42", REQUIRES_LOGIN_RULE_TYPE, {});
    });

    it("rejeita um ruleType que não existe no registry, sem chamar o repositório", async () => {
        const repo = fakeRepository();
        const useCase = new UpsertContentAccessRuleUseCase(repo);

        await expect(
            useCase.execute({ contentType: "newsletter", slug: "pp-news-42", ruleType: "tipo_inexistente", params: {} }),
        ).rejects.toThrow();
        expect(repo.upsert).not.toHaveBeenCalled();
    });
});

describe("RemoveContentAccessRuleUseCase", () => {
    it("remove a regra do conteúdo", async () => {
        const repo = fakeRepository();
        const useCase = new RemoveContentAccessRuleUseCase(repo);

        await useCase.execute("newsletter", "pp-news-42");

        expect(repo.remove).toHaveBeenCalledWith("newsletter", "pp-news-42");
    });
});
