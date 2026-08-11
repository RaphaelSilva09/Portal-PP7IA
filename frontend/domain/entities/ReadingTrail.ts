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
