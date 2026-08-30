import { pool } from "../../lib/db";
import type { ContentAccessRule } from "../../domain/entities/ContentAccessRule";
import type { IContentAccessRuleRepository } from "../../domain/repositories/IContentAccessRuleRepository";

interface Row {
    content_type: string;
    slug: string;
    rule_type: string;
    params: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
}

function toEntity(row: Row): ContentAccessRule {
    return {
        contentType: row.content_type,
        slug: row.slug,
        ruleType: row.rule_type,
        params: row.params,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export class PostgresContentAccessRuleRepository implements IContentAccessRuleRepository {
    async getRule(contentType: string, slug: string): Promise<ContentAccessRule | null> {
        const { rows } = await pool.query<Row>(
            `SELECT content_type, slug, rule_type, params, created_at, updated_at
             FROM public.content_access_rules
             WHERE content_type = $1 AND slug = $2`,
            [contentType, slug],
        );
        return rows[0] ? toEntity(rows[0]) : null;
    }

    async getRulesForSlugs(contentType: string, slugs: string[]): Promise<ContentAccessRule[]> {
        if (slugs.length === 0) return [];
        const { rows } = await pool.query<Row>(
            `SELECT content_type, slug, rule_type, params, created_at, updated_at
             FROM public.content_access_rules
             WHERE content_type = $1 AND slug = ANY($2::text[])`,
            [contentType, slugs],
        );
        return rows.map(toEntity);
    }

    async upsert(contentType: string, slug: string, ruleType: string, params: Record<string, unknown>): Promise<void> {
        await pool.query(
            `INSERT INTO public.content_access_rules (content_type, slug, rule_type, params, updated_at)
             VALUES ($1, $2, $3, $4::jsonb, now())
             ON CONFLICT (content_type, slug) DO UPDATE SET
               rule_type = EXCLUDED.rule_type,
               params = EXCLUDED.params,
               updated_at = now()`,
            [contentType, slug, ruleType, JSON.stringify(params)],
        );
    }

    async remove(contentType: string, slug: string): Promise<void> {
        await pool.query(
            `DELETE FROM public.content_access_rules WHERE content_type = $1 AND slug = $2`,
            [contentType, slug],
        );
    }
}
