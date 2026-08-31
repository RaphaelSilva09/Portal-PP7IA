import type { AccessRuleView } from "./AccessRuleView";

/**
 * Contexto mínimo de quem está pedindo acesso — deliberadamente não é a
 * entidade `User` completa (nome/celular/etc., que exigiria montar a
 * entidade só para checar acesso) nem o `CurrentUser` de
 * `infrastructure/auth/getUser.ts` (domain não deve depender de
 * infrastructure): só os campos que uma regra de acesso poderia
 * plausivelmente precisar.
 */
export interface AccessEvaluationContext {
    userId: string | null;
    role: string | null;
}

/**
 * Strategy de regra de acesso — um tipo de bloqueio de conteúdo (Strategy
 * Pattern). Adicionar um tipo novo é implementar esta interface num arquivo
 * novo em `strategies/` e registrá-lo em `registry.ts`; nenhum dos pontos de
 * consumo (card, pop-up, página de bloqueio, rotas de enforcement) precisa
 * mudar (Open/Closed).
 */
export interface AccessRuleStrategy {
    /** Discriminador salvo em `content_access_rules.rule_type`. */
    readonly type: string;
    /** Rótulo exibido no seletor de tipo de regra do admin. */
    readonly adminLabel: string;

    /**
     * Decide se `context` satisfaz a regra, dados os `params` salvos para
     * este conteúdo. Síncrona e sem I/O — decisão pura de domínio.
     */
    evaluate(context: AccessEvaluationContext, params: Record<string, unknown>): boolean;

    /** Produz o DTO client-safe (ícone, textos, ação de desbloqueio) para este `params`. */
    describe(params: Record<string, unknown>): AccessRuleView;
}
