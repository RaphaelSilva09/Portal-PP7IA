import type { AccessRuleStrategy } from "./AccessRuleStrategy";
import { requiresLoginStrategy } from "./strategies/requiresLogin";

/** Todo tipo de regra de acesso existente — adicionar um tipo novo é acrescentar aqui. */
const STRATEGIES: readonly AccessRuleStrategy[] = [requiresLoginStrategy];

const REGISTRY = new Map<string, AccessRuleStrategy>(STRATEGIES.map(strategy => [strategy.type, strategy]));

export function getAccessRuleStrategy(ruleType: string): AccessRuleStrategy | null {
    return REGISTRY.get(ruleType) ?? null;
}

/** Tipos disponíveis para o seletor de regra do admin. */
export function listAccessRuleStrategies(): readonly AccessRuleStrategy[] {
    return STRATEGIES;
}
