import type { BibliotecaItem } from "@/domain/entities/BibliotecaItem";
import type { ContentType } from "@/domain/entities/ContentItem";
import type { Ebook } from "@/domain/entities/Ebook";
import type { EspecialSemana } from "@/domain/entities/EspecialSemana";
import type { Estudar } from "@/domain/entities/Estudar";
import type { MiniLivro } from "@/domain/entities/MiniLivro";
import type { Newsletter } from "@/domain/entities/Newsletter";
import type { RadarOportunidades } from "@/domain/entities/RadarOportunidades";
import type { IBibliotecaRepository } from "@/domain/repositories/IBibliotecaRepository";
import type { IEbookRepository } from "@/domain/repositories/IEbookRepository";
import type { IEspecialSemanaRepository } from "@/domain/repositories/IEspecialSemanaRepository";
import type { IEstudarRepository } from "@/domain/repositories/IEstudarRepository";
import type { IMiniLivroRepository } from "@/domain/repositories/IMiniLivroRepository";
import type { INewsletterRepository } from "@/domain/repositories/INewsletterRepository";
import type { IRadarOportunidadesRepository } from "@/domain/repositories/IRadarOportunidadesRepository";

const EMPTY_RESULT: GetContentViewNavigationResult = {
    current: null,
    previous: null,
    next: null,
};

const NO_INDEX = 0;
const UNORDERED_PART_POSITION = Number.MAX_SAFE_INTEGER;
const UNORDERED_EBOOK_POSITION = Number.MAX_SAFE_INTEGER;

type NavigationType = ContentType;

export interface GetContentViewNavigationInput {
    type: NavigationType;
    slug: string;
}

export interface ContentViewNavigationLink {
    id: number;
    title: string;
    href: string;
    slug: string;
}

export interface GetContentViewNavigationResult {
    current: ContentViewNavigationLink | null;
    previous: ContentViewNavigationLink | null;
    next: ContentViewNavigationLink | null;
}

interface NavigationCandidate extends ContentViewNavigationLink {
    createdAt: Date;
    index: number;
    order: number | null;
    tema: string | null;
    partOrder: number | null;
}

interface GetContentViewNavigationDependencies {
    newsletterRepository: Pick<INewsletterRepository, "getAll">;
    miniLivroRepository: Pick<IMiniLivroRepository, "getAll">;
    bibliotecaRepository: Pick<IBibliotecaRepository, "getAll">;
    especialSemanaRepository: Pick<IEspecialSemanaRepository, "getAll">;
    radarOportunidadesRepository: Pick<IRadarOportunidadesRepository, "getAll">;
    estudarRepository: Pick<IEstudarRepository, "getAll">;
    ebookRepository: Pick<IEbookRepository, "getAll">;
}

function extractSlugFromViewPath(path: string | null): string | null {
    if (!path) {
        return null;
    }

    const match = path.match(/^\/view\/[^/]+\/([^/?#]+)$/);
    return match?.[1] ?? null;
}

function buildNavigationCandidate(params: {
    id: number;
    title: string;
    href: string | null;
    createdAt: Date;
    index?: number;
    order?: number | null;
    tema?: string | null;
    partOrder?: number | null;
}): NavigationCandidate | null {
    const slug = extractSlugFromViewPath(params.href);

    if (!params.href || !slug) {
        return null;
    }

    return {
        id: params.id,
        title: params.title,
        href: params.href,
        slug,
        createdAt: params.createdAt,
        index: params.index ?? NO_INDEX,
        order: params.order ?? null,
        tema: params.tema ?? null,
        partOrder: params.partOrder ?? null,
    };
}

function compareIndexedCandidates(left: NavigationCandidate, right: NavigationCandidate): number {
    const leftHasManualIndex = left.index > NO_INDEX;
    const rightHasManualIndex = right.index > NO_INDEX;

    if (leftHasManualIndex && rightHasManualIndex) {
        if (left.index !== right.index) {
            return left.index - right.index;
        }

        return left.id - right.id;
    }

    if (leftHasManualIndex !== rightHasManualIndex) {
        return leftHasManualIndex ? -1 : 1;
    }

    const createdAtDifference = right.createdAt.getTime() - left.createdAt.getTime();

    if (createdAtDifference !== 0) {
        return createdAtDifference;
    }

    return left.id - right.id;
}

function compareEbookCandidates(left: NavigationCandidate, right: NavigationCandidate): number {
    const leftOrder = left.order ?? UNORDERED_EBOOK_POSITION;
    const rightOrder = right.order ?? UNORDERED_EBOOK_POSITION;

    if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
    }

    return left.id - right.id;
}

function compareMiniLivroCandidates(left: NavigationCandidate, right: NavigationCandidate): number {
    const leftPartOrder = left.partOrder ?? UNORDERED_PART_POSITION;
    const rightPartOrder = right.partOrder ?? UNORDERED_PART_POSITION;

    if (leftPartOrder !== rightPartOrder) {
        return leftPartOrder - rightPartOrder;
    }

    return compareIndexedCandidates(left, right);
}

function mapNewsletterCandidate(item: Newsletter): NavigationCandidate | null {
    return buildNavigationCandidate({
        id: item.id,
        title: item.title,
        href: item.htmlPath,
        createdAt: item.createdAt,
        index: item.index,
    });
}

function mapMiniLivroCandidate(item: MiniLivro): NavigationCandidate | null {
    return buildNavigationCandidate({
        id: item.id,
        title: item.title,
        href: item.htmlPath,
        createdAt: item.createdAt,
        index: item.index,
        partOrder: item.partOrder,
    });
}

function mapBibliotecaCandidate(item: BibliotecaItem): NavigationCandidate | null {
    return buildNavigationCandidate({
        id: item.id,
        title: item.title,
        href: item.htmlPath,
        createdAt: item.createdAt,
        index: item.index,
        tema: item.tema,
    });
}

function mapEspecialSemanaCandidate(item: EspecialSemana): NavigationCandidate | null {
    return buildNavigationCandidate({
        id: item.id,
        title: item.title,
        href: item.htmlPath,
        createdAt: item.createdAt,
        index: item.index,
    });
}

function mapRadarCandidate(item: RadarOportunidades): NavigationCandidate | null {
    return buildNavigationCandidate({
        id: item.id,
        title: item.title,
        href: item.htmlPath,
        createdAt: item.createdAt,
        index: item.index,
    });
}

function mapEstudarCandidate(item: Estudar): NavigationCandidate | null {
    return buildNavigationCandidate({
        id: item.id,
        title: item.title,
        href: item.htmlPath,
        createdAt: item.createdAt,
        index: item.index,
    });
}

function mapEbookCandidate(item: Ebook): NavigationCandidate | null {
    return buildNavigationCandidate({
        id: item.id,
        title: item.title,
        href: item.introHtmlPath,
        createdAt: item.createdAt,
        order: item.order,
    });
}

export class GetContentViewNavigationUseCase {
    constructor(private readonly dependencies: GetContentViewNavigationDependencies) {}

    async execute({ type, slug }: GetContentViewNavigationInput): Promise<GetContentViewNavigationResult> {
        const candidates = await this.getCandidates(type);
        const current = candidates.find(item => item.slug === slug);

        if (!current) {
            return EMPTY_RESULT;
        }

        const scopedCandidates = this.filterCandidatesByScope(type, candidates, current).sort((left, right) => {
            if (type === "ebook") {
                return compareEbookCandidates(left, right);
            }

            if (type === "mini-livro") {
                return compareMiniLivroCandidates(left, right);
            }

            return compareIndexedCandidates(left, right);
        });

        const currentIndex = scopedCandidates.findIndex(item => item.slug === current.slug);

        if (currentIndex === -1) {
            return EMPTY_RESULT;
        }

        return {
            current: this.toNavigationLink(scopedCandidates[currentIndex]),
            previous: this.toNavigationLink(scopedCandidates[currentIndex - 1] ?? null),
            next: this.toNavigationLink(scopedCandidates[currentIndex + 1] ?? null),
        };
    }

    private async getCandidates(type: NavigationType): Promise<NavigationCandidate[]> {
        switch (type) {
            case "newsletter": {
                const items = await this.dependencies.newsletterRepository.getAll();
                return items.map(mapNewsletterCandidate).filter((item): item is NavigationCandidate => item !== null);
            }
            case "mini-livro": {
                const items = await this.dependencies.miniLivroRepository.getAll();
                return items.map(mapMiniLivroCandidate).filter((item): item is NavigationCandidate => item !== null);
            }
            case "biblioteca": {
                const items = await this.dependencies.bibliotecaRepository.getAll();
                return items.map(mapBibliotecaCandidate).filter((item): item is NavigationCandidate => item !== null);
            }
            case "especial-semana": {
                const items = await this.dependencies.especialSemanaRepository.getAll();
                return items.map(mapEspecialSemanaCandidate).filter((item): item is NavigationCandidate => item !== null);
            }
            case "radar_oportunidades": {
                const items = await this.dependencies.radarOportunidadesRepository.getAll();
                return items.map(mapRadarCandidate).filter((item): item is NavigationCandidate => item !== null);
            }
            case "estudar": {
                const items = await this.dependencies.estudarRepository.getAll();
                return items.map(mapEstudarCandidate).filter((item): item is NavigationCandidate => item !== null);
            }
            case "ebook": {
                const items = await this.dependencies.ebookRepository.getAll();
                return items.map(mapEbookCandidate).filter((item): item is NavigationCandidate => item !== null);
            }
        }

        return [];
    }

    private filterCandidatesByScope(
        type: NavigationType,
        candidates: NavigationCandidate[],
        current: NavigationCandidate,
    ): NavigationCandidate[] {
        if (type === "biblioteca") {
            return candidates.filter(item => item.tema === current.tema);
        }

        return candidates;
    }

    private toNavigationLink(item: NavigationCandidate | null): ContentViewNavigationLink | null {
        if (!item) {
            return null;
        }

        return {
            id: item.id,
            title: item.title,
            href: item.href,
            slug: item.slug,
        };
    }
}
