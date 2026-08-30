/**
 * UpsertContentAccessRuleUseCase (Application Layer)
 *
 * Cria ou substitui a regra de bloqueio de um conteúdo — usado pelo admin.
 */

import type { IContentAccessRuleRepository } from "../../domain/repositories/IContentAccessRuleRepository";
import { getAccessRuleStrategy } from "../../domain/access-rules/registry";

export interface UpsertContentAccessRuleInput {
    contentType: string;
    slug: string;
    ruleType: string;
    params: Record<string, unknown>;
}

export class UpsertContentAccessRuleUseCase {
    constructor(private readonly repository: IContentAccessRuleRepository) {}

    async execute(input: UpsertContentAccessRuleInput): Promise<void> {
        if (!getAccessRuleStrategy(input.ruleType)) {
            throw new Error(`Tipo de regra de acesso desconhecido: ${input.ruleType}`);
        }
        await this.repository.upsert(input.contentType, input.slug, input.ruleType, input.params);
    }
}
