/** ContentAccessRule (Domain Layer) — regra de bloqueio salva para um conteúdo (content_type + slug). */

export interface ContentAccessRule {
    contentType: string;
    slug: string;
    /** Discriminador resolvido via `domain/access-rules/registry.ts`. */
    ruleType: string;
    /** Estrutura opaca a esta entidade — validada e interpretada pela strategy dona de `ruleType`. */
    params: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
