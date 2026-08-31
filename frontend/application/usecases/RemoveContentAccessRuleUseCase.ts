/**
 * RemoveContentAccessRuleUseCase (Application Layer)
 *
 * Remove a regra de bloqueio de um conteúdo, se existir — usado pelo admin.
 */

import type { IContentAccessRuleRepository } from "../../domain/repositories/IContentAccessRuleRepository";

export class RemoveContentAccessRuleUseCase {
    constructor(private readonly repository: IContentAccessRuleRepository) {}

    async execute(contentType: string, slug: string): Promise<void> {
        await this.repository.remove(contentType, slug);
    }
}
