import type { ContentAccessRule } from "../entities/ContentAccessRule";

export interface IContentAccessRuleRepository {
    /** Regra salva para este conteúdo (null = não bloqueado). */
    getRule(contentType: string, slug: string): Promise<ContentAccessRule | null>;

    /** Regras salvas para vários slugs do mesmo tipo de conteúdo, numa única consulta — uso em listagem. */
    getRulesForSlugs(contentType: string, slugs: string[]): Promise<ContentAccessRule[]>;

    /** Grava (cria ou substitui) a regra do conteúdo — idempotente. */
    upsert(contentType: string, slug: string, ruleType: string, params: Record<string, unknown>): Promise<void>;

    /** Remove a regra do conteúdo, se existir. */
    remove(contentType: string, slug: string): Promise<void>;
}
