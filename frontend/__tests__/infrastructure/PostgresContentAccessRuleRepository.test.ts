import { beforeEach, describe, expect, it, vi } from "vitest";

interface FakeRow {
    content_type: string;
    slug: string;
    rule_type: string;
    params: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
}

const table = new Map<string, FakeRow>();
const key = (contentType: string, slug: string) => `${contentType}:${slug}`;

const queryMock = vi.fn(async (sql: string, values: unknown[]) => {
    if (sql.includes("SELECT content_type, slug, rule_type, params, created_at, updated_at") && sql.includes("slug = ANY")) {
        const [contentType, slugs] = values as [string, string[]];
        const rows = slugs
            .map(slug => table.get(key(contentType, slug)))
            .filter((row): row is FakeRow => row !== undefined);
        return { rows };
    }

    if (sql.includes("SELECT content_type, slug, rule_type, params, created_at, updated_at")) {
        const [contentType, slug] = values as [string, string];
        const row = table.get(key(contentType, slug));
        return { rows: row ? [row] : [] };
    }

    if (sql.includes("INSERT INTO public.content_access_rules")) {
        const [contentType, slug, ruleType, paramsJson] = values as [string, string, string, string];
        const existing = table.get(key(contentType, slug));
        table.set(key(contentType, slug), {
            content_type: contentType,
            slug,
            rule_type: ruleType,
            params: JSON.parse(paramsJson),
            created_at: existing?.created_at ?? new Date(),
            updated_at: new Date(),
        });
        return { rows: [] };
    }

    if (sql.includes("DELETE FROM public.content_access_rules")) {
        const [contentType, slug] = values as [string, string];
        table.delete(key(contentType, slug));
        return { rows: [] };
    }

    throw new Error(`Unhandled fake query: ${sql}`);
});

vi.mock("@/lib/db", () => ({
    pool: { query: queryMock },
}));

const { PostgresContentAccessRuleRepository } = await import(
    "@/infrastructure/repositories/PostgresContentAccessRuleRepository"
);

describe("PostgresContentAccessRuleRepository", () => {
    beforeEach(() => {
        table.clear();
        queryMock.mockClear();
    });

    it("conteúdo sem regra devolve null", async () => {
        const repo = new PostgresContentAccessRuleRepository();
        expect(await repo.getRule("newsletter", "pp-news-42")).toBeNull();
    });

    it("upsert grava e get devolve a mesma regra", async () => {
        const repo = new PostgresContentAccessRuleRepository();
        await repo.upsert("newsletter", "pp-news-42", "requires_login", {});

        const rule = await repo.getRule("newsletter", "pp-news-42");
        expect(rule).toMatchObject({ contentType: "newsletter", slug: "pp-news-42", ruleType: "requires_login", params: {} });
        expect(rule?.updatedAt).toBeInstanceOf(Date);
    });

    it("upsert repetido substitui o ruleType/params anteriores (idempotente, respeitando o UNIQUE(content_type, slug))", async () => {
        const repo = new PostgresContentAccessRuleRepository();
        await repo.upsert("newsletter", "pp-news-42", "requires_login", { a: 1 });
        await repo.upsert("newsletter", "pp-news-42", "requires_login", { a: 2 });

        const rule = await repo.getRule("newsletter", "pp-news-42");
        expect(rule?.params).toEqual({ a: 2 });
    });

    it("remove apaga a regra", async () => {
        const repo = new PostgresContentAccessRuleRepository();
        await repo.upsert("newsletter", "pp-news-42", "requires_login", {});
        await repo.remove("newsletter", "pp-news-42");

        expect(await repo.getRule("newsletter", "pp-news-42")).toBeNull();
    });

    it("remover uma regra inexistente não falha (idempotente)", async () => {
        const repo = new PostgresContentAccessRuleRepository();
        await expect(repo.remove("newsletter", "nunca-existiu")).resolves.not.toThrow();
    });

    it("isola regras por tipo de conteúdo (mesmo slug, tipos diferentes)", async () => {
        const repo = new PostgresContentAccessRuleRepository();
        await repo.upsert("newsletter", "x", "requires_login", {});

        expect(await repo.getRule("biblioteca", "x")).toBeNull();
    });

    it("getRulesForSlugs devolve só as regras existentes, isoladas por tipo de conteúdo", async () => {
        const repo = new PostgresContentAccessRuleRepository();
        await repo.upsert("newsletter", "a", "requires_login", {});
        await repo.upsert("newsletter", "b", "requires_login", {});
        await repo.upsert("biblioteca", "a", "requires_login", {});

        const rules = await repo.getRulesForSlugs("newsletter", ["a", "b", "c"]);

        expect(rules.map(r => r.slug).sort()).toEqual(["a", "b"]);
    });

    it("getRulesForSlugs com lista vazia não consulta o banco", async () => {
        const repo = new PostgresContentAccessRuleRepository();
        const rules = await repo.getRulesForSlugs("newsletter", []);

        expect(rules).toEqual([]);
        expect(queryMock).not.toHaveBeenCalled();
    });
});
