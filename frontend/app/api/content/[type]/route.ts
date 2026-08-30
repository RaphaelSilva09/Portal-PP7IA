import { NextRequest, NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { getUser } from "@/infrastructure/auth/getUser";
import type { ContentType } from "@/domain/entities/ContentItem";
import { Newsletter, type NewsletterProps } from "@/domain/entities/Newsletter";
import { MiniLivro, type MiniLivroProps } from "@/domain/entities/MiniLivro";
import { BibliotecaItem, type BibliotecaItemProps } from "@/domain/entities/BibliotecaItem";
import { EspecialSemana, type EspecialSemanaProps } from "@/domain/entities/EspecialSemana";
import { RadarOportunidades, type RadarOportunidadesProps } from "@/domain/entities/RadarOportunidades";
import { Estudar, type EstudarProps } from "@/domain/entities/Estudar";
import type { AccessRuleView } from "@/domain/access-rules/AccessRuleView";
import type { AccessEvaluationContext } from "@/domain/access-rules/AccessRuleStrategy";

export const runtime = "nodejs";

const VALID_TYPES = new Set<ContentType>([
    "biblioteca",
    "newsletter",
    "mini-livro",
    "especial-semana",
    "radar_oportunidades",
    "estudar",
]);

interface EntityLike<P> {
    htmlPath: string | null;
    toObject(): P;
}

/** Mesma extração de `slugFromHref` de components/explorar/ContentCards.tsx — não importada daqui de propósito, para não puxar um módulo "use client" para uma rota de servidor. */
function slugFromPublicPath(href: string | null): string | null {
    if (!href) return null;
    return href.split("/").pop() || null;
}

/**
 * Anexa `accessRule` a cada item, via uma única consulta em lote — não um
 * round-trip por item. Reconstrói cada entidade (imutável) com
 * `create({...toObject(), accessRule})`, mesma técnica já usada para outros
 * campos derivados (ex.: `updatedAt`).
 *
 * `context` é o leitor que está pedindo a listagem — sem isso, o selo de
 * bloqueio apareceria pra qualquer um, inclusive quem já satisfaz a regra
 * (ex.: leitor logado vendo "exige login" do mesmo jeito que um anônimo).
 * `unfiltered` pula essa filtragem — só usado pelo painel admin.
 */
async function attachAccessRules<E extends EntityLike<P>, P extends { accessRule?: AccessRuleView | null }>(
    contentType: ContentType,
    entities: E[],
    create: (props: P) => E,
    context: AccessEvaluationContext,
    unfiltered: boolean,
): Promise<E[]> {
    const slugs = entities
        .map(entity => slugFromPublicPath(entity.htmlPath))
        .filter((slug): slug is string => slug !== null);
    if (slugs.length === 0) return entities;

    const rules = await DIContainer.getContentAccessRulesForListingUseCase().execute(contentType, slugs, context, { unfiltered });
    if (rules.size === 0) return entities;

    return entities.map(entity => {
        const slug = slugFromPublicPath(entity.htmlPath);
        const accessRule = slug ? rules.get(slug) ?? null : null;
        return create({ ...entity.toObject(), accessRule });
    });
}

async function attachAccessRulesToListing<E extends EntityLike<P>, P extends { accessRule?: AccessRuleView | null }>(
    contentType: ContentType,
    result: { latest: E | null; older: E[] },
    create: (props: P) => E,
    context: AccessEvaluationContext,
    unfiltered: boolean,
): Promise<{ latest: E | null; older: E[] }> {
    const combined = result.latest ? [result.latest, ...result.older] : result.older;
    const enriched = await attachAccessRules(contentType, combined, create, context, unfiltered);
    if (!result.latest) return { latest: null, older: enriched };
    const [latest, ...older] = enriched;
    return { latest, older };
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ type: string }> },
) {
    const { type } = await params;
    if (!VALID_TYPES.has(type as ContentType)) {
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    const ct = type as ContentType;

    const user = await getUser();
    const context: AccessEvaluationContext = { userId: user?.id ?? null, role: user?.role ?? null };
    // ?scope=admin só tem efeito pra quem É admin de verdade (checado na
    // sessão, não no que a URL diz) — o painel admin precisa ver toda regra
    // configurada, não só as que o próprio admin não passaria.
    const unfiltered = req.nextUrl.searchParams.get("scope") === "admin" && context.role === "admin";

    let payload: unknown;
    switch (ct) {
        case "biblioteca": {
            const uc = DIContainer.getBibliotecaUseCase();
            const result = await uc.execute();
            payload = await attachAccessRulesToListing<BibliotecaItem, BibliotecaItemProps>(ct, result, BibliotecaItem.create, context, unfiltered);
            break;
        }
        case "newsletter": {
            const uc = DIContainer.getNewslettersUseCase();
            const result = await uc.execute();
            payload = await attachAccessRulesToListing<Newsletter, NewsletterProps>(ct, result, Newsletter.create, context, unfiltered);
            break;
        }
        case "mini-livro": {
            const uc = DIContainer.getMiniLivrosUseCase();
            const result = await uc.execute();
            const { latest, older } = await attachAccessRulesToListing<MiniLivro, MiniLivroProps>(ct, result, MiniLivro.create, context, unfiltered);
            payload = { latest, older, all: latest ? [latest, ...older] : older };
            break;
        }
        case "especial-semana": {
            const uc = DIContainer.getEspecialSemanaUseCase();
            const all = await uc.execute();
            payload = await attachAccessRules<EspecialSemana, EspecialSemanaProps>(ct, all, EspecialSemana.create, context, unfiltered);
            break;
        }
        case "radar_oportunidades": {
            const uc = DIContainer.getRadarOportunidadesUseCase();
            const result = await uc.execute();
            payload = await attachAccessRulesToListing<RadarOportunidades, RadarOportunidadesProps>(ct, result, RadarOportunidades.create, context, unfiltered);
            break;
        }
        case "estudar": {
            const uc = DIContainer.getEstudarUseCase();
            const result = await uc.execute();
            payload = await attachAccessRulesToListing<Estudar, EstudarProps>(ct, result, Estudar.create, context, unfiltered);
            break;
        }
    }

    const repo = DIContainer.getContentRepository();
    const lastUpdated = await repo.getLastUpdated(ct);

    // Some use cases return arrays (e.g. especial-semana, radar_oportunidades);
    // others return objects with { latest, older, ... }. Wrap arrays under `items`
    // so the JSON shape never depends on JS object/array spread semantics.
    if (Array.isArray(payload)) {
        return NextResponse.json({ items: payload, lastUpdated });
    }
    return NextResponse.json({ ...(payload as object), lastUpdated });
}
