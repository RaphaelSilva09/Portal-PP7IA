/**
 * GetContentAccessRulesForListingUseCase (Application Layer)
 *
 * Resolve, numa única consulta em lote, o `AccessRuleView` de cada item de
 * uma listagem (ex.: `/api/content/[type]`) — evita um round-trip por item
 * de conteúdo para decidir se o card mostra o selo de bloqueio.
 *
 * Por padrão (`unfiltered` ausente/false), uma regra só entra no resultado
 * se o leitor de `context` NÃO passar em `strategy.evaluate(...)` — ou seja,
 * o mapa devolvido reflete "o que este leitor específico não pode acessar
 * agora", não "todo conteúdo com alguma regra configurada". Sem isso, um
 * leitor já logado veria o selo/pop-up de "exige login" do mesmo jeito que
 * um leitor anônimo, porque a regra existe independente de quem está
 * olhando. `unfiltered: true` pula essa filtragem — uso restrito ao painel
 * admin, que precisa ver toda regra configurada (é gerenciamento de
 * conteúdo, não leitura), independente do admin logado satisfazer a regra.
 *
 * Um `ruleType` que não existe mais no registry é omitido do resultado (o
 * card correspondente simplesmente não mostra selo) em vez de falhar a
 * listagem inteira — a checagem que realmente importa para segurança é
 * `EvaluateContentAccessUseCase`, usada no ponto de acesso ao conteúdo, não
 * aqui.
 */

import type { IContentAccessRuleRepository } from "../../domain/repositories/IContentAccessRuleRepository";
import { getAccessRuleStrategy } from "../../domain/access-rules/registry";
import type { AccessRuleView } from "../../domain/access-rules/AccessRuleView";
import type { AccessEvaluationContext } from "../../domain/access-rules/AccessRuleStrategy";

export class GetContentAccessRulesForListingUseCase {
    constructor(private readonly repository: IContentAccessRuleRepository) {}

    async execute(
        contentType: string,
        slugs: string[],
        context: AccessEvaluationContext,
        options?: { unfiltered?: boolean },
    ): Promise<Map<string, AccessRuleView>> {
        const rules = await this.repository.getRulesForSlugs(contentType, slugs);
        const view = new Map<string, AccessRuleView>();

        for (const rule of rules) {
            const strategy = getAccessRuleStrategy(rule.ruleType);
            if (!strategy) continue;
            if (!options?.unfiltered && strategy.evaluate(context, rule.params)) continue;
            view.set(rule.slug, strategy.describe(rule.params));
        }

        return view;
    }
}
