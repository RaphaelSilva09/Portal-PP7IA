/**
 * EvaluateContentAccessUseCase (Application Layer)
 *
 * Decide se um leitor pode acessar um conteúdo individual — usado pela
 * página `/view`, pela rota que serve o HTML de verdade (proxy-html) e pela
 * exportação em PDF. É o único lugar que combina "existe regra salva?" com
 * "a regra permite este leitor?".
 */

import type { IContentAccessRuleRepository } from "../../domain/repositories/IContentAccessRuleRepository";
import { getAccessRuleStrategy } from "../../domain/access-rules/registry";
import type { AccessRuleView } from "../../domain/access-rules/AccessRuleView";

export interface EvaluateContentAccessInput {
    contentType: string;
    slug: string;
    userId: string | null;
    role: string | null;
}

export type ContentAccessResult =
    | { allowed: true }
    | { allowed: false; view: AccessRuleView };

/** DTO de fallback quando a regra salva referencia um `ruleType` que não existe mais no registry. */
function unknownRuleTypeView(ruleType: string): AccessRuleView {
    return {
        ruleType,
        icon: "lock",
        cardLabel: "Acesso restrito",
        modalTitle: "Este conteúdo está com acesso restrito",
        modalMessage: "Não foi possível confirmar seu acesso a este conteúdo agora. Tente novamente em instantes.",
        unlockButtonLabel: "Tentar novamente",
        unlockAction: { kind: "retry" },
    };
}

export class EvaluateContentAccessUseCase {
    constructor(private readonly repository: IContentAccessRuleRepository) {}

    async execute(input: EvaluateContentAccessInput): Promise<ContentAccessResult> {
        const rule = await this.repository.getRule(input.contentType, input.slug);
        if (!rule) return { allowed: true };

        const strategy = getAccessRuleStrategy(rule.ruleType);
        if (!strategy) {
            // Tipo de regra desconhecido (dado órfão — ex.: removido do
            // registry depois de salvo). Falha fechado: mais seguro
            // bloquear um conteúdo que deveria estar liberado do que
            // liberar um conteúdo que o admin marcou como restrito.
            return { allowed: false, view: unknownRuleTypeView(rule.ruleType) };
        }

        const allowed = strategy.evaluate({ userId: input.userId, role: input.role }, rule.params);
        if (allowed) return { allowed: true };

        return { allowed: false, view: strategy.describe(rule.params) };
    }
}
