/** ReadingTrail (Domain Layer) — trilhas de leitura guiadas (PP7I-260811-1800, item 3.2). */

export interface ReadingTrailItemRef {
    contentType: string;
    contentId: string;
    position: number;
}

/** Registro bruto de uma trilha, com os itens na ordem cadastrada (admin + hidratação). */
export interface ReadingTrailRecord {
    id: number;
    slug: string;
    title: string;
    description: string;
    coverImagePath: string | null;
    published: boolean;
    items: ReadingTrailItemRef[];
    createdAt: Date;
    updatedAt: Date;
}

/** Resumo para a listagem pública (/trilhas). */
export interface ReadingTrailSummary {
    slug: string;
    title: string;
    description: string;
    coverImagePath: string | null;
    itemCount: number;
}

/** Um passo da trilha já hidratado com título/link do conteúdo e se o leitor concluiu. */
export interface ReadingTrailStep {
    contentType: string;
    contentId: string;
    position: number;
    title: string;
    href: string;
    completed: boolean;
}

/** Trilha pronta para a página de detalhe (/trilhas/[slug]). */
export interface ReadingTrailDetail {
    slug: string;
    title: string;
    description: string;
    coverImagePath: string | null;
    steps: ReadingTrailStep[];
}

/** Índice do primeiro passo ainda não concluído (CTA "Continuar trilha"). Null se tudo concluído ou a trilha está vazia. */
export function nextUnreadStepIndex(steps: ReadingTrailStep[]): number | null {
    const idx = steps.findIndex(s => !s.completed);
    return idx === -1 ? null : idx;
}

export function completedStepCount(steps: ReadingTrailStep[]): number {
    return steps.filter(s => s.completed).length;
}

export interface TrailStepLink {
    href: string;
    title: string;
}

/** Navegação anterior/próximo dentro de uma trilha — mesma ideia do "próximo capítulo" do mini-livro, mas por trilha. */
export interface TrailStepNavigation {
    trailSlug: string;
    trailTitle: string;
    /** Posição do passo atual, 1-baseada. */
    position: number;
    total: number;
    previous: TrailStepLink | null;
    next: TrailStepLink | null;
}

/**
 * Localiza o passo atual (por content_type/content_id) numa trilha já hidratada
 * e monta a navegação anterior/próximo — os links carregam `?trilha={slug}`
 * para preservar o contexto ao longo de toda a leitura sequencial.
 * Retorna null se o conteúdo atual não pertence a essa trilha.
 */
export function findTrailStepNavigation(
    trail: Pick<ReadingTrailDetail, "slug" | "title" | "steps">,
    contentType: string,
    contentId: string,
): TrailStepNavigation | null {
    const idx = trail.steps.findIndex(s => s.contentType === contentType && s.contentId === contentId);
    if (idx === -1) return null;

    const withTrailParam = (step: ReadingTrailStep): TrailStepLink => ({
        href: `${step.href}?trilha=${trail.slug}`,
        title: step.title,
    });

    return {
        trailSlug: trail.slug,
        trailTitle: trail.title,
        position: idx + 1,
        total: trail.steps.length,
        previous: idx > 0 ? withTrailParam(trail.steps[idx - 1]) : null,
        next: idx < trail.steps.length - 1 ? withTrailParam(trail.steps[idx + 1]) : null,
    };
}
