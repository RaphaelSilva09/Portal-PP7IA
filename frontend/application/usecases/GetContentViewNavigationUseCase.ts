import type { Book } from "@/domain/entities/Book";
import type { BibliotecaItem } from "@/domain/entities/BibliotecaItem";
import type { ContentType } from "@/domain/entities/ContentItem";
import type { Ebook } from "@/domain/entities/Ebook";
import type { EspecialSemana } from "@/domain/entities/EspecialSemana";
import type { Estudar } from "@/domain/entities/Estudar";
import type { MiniLivro } from "@/domain/entities/MiniLivro";
import type { MiniLivroSection, MiniLivroSectionKind } from "@/domain/entities/MiniLivroSection";
import type { Newsletter } from "@/domain/entities/Newsletter";
import type { RadarOportunidades } from "@/domain/entities/RadarOportunidades";
import type { IBookRepository } from "@/domain/repositories/IBookRepository";
import type { IBibliotecaRepository } from "@/domain/repositories/IBibliotecaRepository";
import type { IEbookRepository } from "@/domain/repositories/IEbookRepository";
import type { IEspecialSemanaRepository } from "@/domain/repositories/IEspecialSemanaRepository";
import type { IEstudarRepository } from "@/domain/repositories/IEstudarRepository";
import type { IMiniLivroRepository } from "@/domain/repositories/IMiniLivroRepository";
import type { IMiniLivroSectionRepository } from "@/domain/repositories/IMiniLivroSectionRepository";
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
const BOOK_PART_POSITION = 0;

export type ContentViewNavigationType = ContentType | "book" | "mini-livro-section";

type NavigationType = ContentViewNavigationType;

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
    viewType: NavigationType;
    createdAt: Date;
    index: number;
    order: number | null;
    tema: string | null;
    partOrder: number | null;
    sectionKind: MiniLivroSectionKind | null;
}

interface GetContentViewNavigationDependencies {
    bookRepository: Pick<IBookRepository, "getActiveBook">;
    newsletterRepository: Pick<INewsletterRepository, "getAll">;
    miniLivroRepository: Pick<IMiniLivroRepository, "getAll">;
    miniLivroSectionRepository: Pick<IMiniLivroSectionRepository, "getAll">;
    bibliotecaRepository: Pick<IBibliotecaRepository, "getAll">;
    especialSemanaRepository: Pick<IEspecialSemanaRepository, "getAll">;
    radarOportunidadesRepository: Pick<IRadarOportunidadesRepository, "getAll">;
    estudarRepository: Pick<IEstudarRepository, "getAll">;
    ebookRepository: Pick<IEbookRepository, "getAll">;
}

function extractViewReference(path: string | null): { type: NavigationType; slug: string } | null {
    if (!path) {
        return null;
    }

    const match = path.match(/^\/view\/([^/]+)\/([^/?#]+)$/);

    if (!match) {
        return null;
    }

    return {
        type: match[1] as NavigationType,
        slug: match[2],
    };
}

function buildNavigationCandidate(params: {
    id: number;
    title: string;
    href: string | null;
    createdAt?: Date;
    index?: number;
    order?: number | null;
    tema?: string | null;
    partOrder?: number | null;
    sectionKind?: MiniLivroSectionKind | null;
}): NavigationCandidate | null {
    const viewReference = extractViewReference(params.href);

    if (!params.href || !viewReference) {
        return null;
    }

    return {
        id: params.id,
        title: params.title,
        href: params.href,
        slug: viewReference.slug,
        viewType: viewReference.type,
        createdAt: params.createdAt ?? new Date(0),
        index: params.index ?? NO_INDEX,
        order: params.order ?? null,
        tema: params.tema ?? null,
        partOrder: params.partOrder ?? null,
        sectionKind: params.sectionKind ?? null,
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

function getBookJourneyPartOrder(candidate: NavigationCandidate): number {
    if (candidate.viewType === "book") {
        return BOOK_PART_POSITION;
    }

    if (candidate.viewType === "mini-livro-section") {
        return candidate.sectionKind === "prefacio" ? 1 : UNORDERED_PART_POSITION;
    }

    return (candidate.partOrder ?? candidate.order ?? UNORDERED_PART_POSITION) + 1;
}

function getBookJourneyKindOrder(candidate: NavigationCandidate): number {
    if (candidate.viewType === "book") {
        return 0;
    }

    if (candidate.viewType === "mini-livro-section") {
        return candidate.sectionKind === "prefacio" ? 0 : 2;
    }

    if (candidate.viewType === "ebook") {
        return 1;
    }

    return 2;
}

function compareBookJourneyCandidates(left: NavigationCandidate, right: NavigationCandidate): number {
    const partDifference = getBookJourneyPartOrder(left) - getBookJourneyPartOrder(right);

    if (partDifference !== 0) {
        return partDifference;
    }

    const kindDifference = getBookJourneyKindOrder(left) - getBookJourneyKindOrder(right);

    if (kindDifference !== 0) {
        return kindDifference;
    }

    if (left.viewType === "mini-livro" && right.viewType === "mini-livro") {
        return compareIndexedCandidates(left, right);
    }

    if (left.viewType === "ebook" && right.viewType === "ebook") {
        return compareEbookCandidates(left, right);
    }

    if (left.viewType === "mini-livro-section" && right.viewType === "mini-livro-section") {
        return compareIndexedCandidates(left, right);
    }

    return left.id - right.id;
}

function mapBookCandidate(item: Book): NavigationCandidate | null {
    return buildNavigationCandidate({
        id: item.id,
        title: item.title,
        href: item.introHtmlPath,
    });
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

function mapMiniLivroSectionCandidate(item: MiniLivroSection): NavigationCandidate | null {
    return buildNavigationCandidate({
        id: item.id,
        title: item.title,
        href: item.htmlPath,
        createdAt: item.createdAt,
        index: item.index,
        sectionKind: item.kind,
    });
}

export class GetContentViewNavigationUseCase {
    constructor(private readonly dependencies: GetContentViewNavigationDependencies) {}

    async execute({ type, slug }: GetContentViewNavigationInput): Promise<GetContentViewNavigationResult> {
        const candidates = await this.getCandidatesForType(type);
        const current = candidates.find(item => item.viewType === type && item.slug === slug);

        if (!current) {
            return EMPTY_RESULT;
        }

        const scopedCandidates = this.sortCandidates(type, this.filterCandidatesByScope(type, candidates, current));

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

    private async getCandidatesForType(type: NavigationType): Promise<NavigationCandidate[]> {
        if (this.isBookJourneyType(type)) {
            return this.getBookJourneyCandidates();
        }

        return this.getCandidates(type);
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

    private async getBookJourneyCandidates(): Promise<NavigationCandidate[]> {
        const [book, ebooks, miniLivros, miniLivroSections] = await Promise.all([
            this.dependencies.bookRepository.getActiveBook(),
            this.dependencies.ebookRepository.getAll(),
            this.dependencies.miniLivroRepository.getAll(),
            this.dependencies.miniLivroSectionRepository.getAll(),
        ]);

        return [
            book ? mapBookCandidate(book) : null,
            ...miniLivroSections.map(mapMiniLivroSectionCandidate),
            ...ebooks.map(mapEbookCandidate),
            ...miniLivros.map(mapMiniLivroCandidate),
        ].filter((item): item is NavigationCandidate => item !== null);
    }

    private sortCandidates(type: NavigationType, candidates: NavigationCandidate[]): NavigationCandidate[] {
        return [...candidates].sort((left, right) => {
            if (this.isBookJourneyType(type)) {
                return compareBookJourneyCandidates(left, right);
            }

            return compareIndexedCandidates(left, right);
        });
    }

    private isBookJourneyType(type: NavigationType): type is "book" | "ebook" | "mini-livro" | "mini-livro-section" {
        return type === "book" || type === "ebook" || type === "mini-livro" || type === "mini-livro-section";
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
