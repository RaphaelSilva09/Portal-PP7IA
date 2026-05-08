import { MINI_LIVRO_SECTION_VIEW_TYPE } from "@/constants/miniLivroSections";

export type MiniLivroSectionKind = "prefacio" | "encerramento";

export interface MiniLivroSectionProps {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    kind: MiniLivroSectionKind;
    title: string;
    description: string | null;
    htmlPath: string | null;
    index: number;
}

export class MiniLivroSection {
    private constructor(private readonly props: MiniLivroSectionProps) {}

    static create(props: MiniLivroSectionProps): MiniLivroSection {
        return new MiniLivroSection(props);
    }

    get id(): number {
        return this.props.id ?? 0;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    get kind(): MiniLivroSectionKind {
        return this.props.kind;
    }

    get title(): string {
        return this.props.title?.trim() || "Seção indisponível";
    }

    get description(): string | null {
        return this.props.description?.trim() || null;
    }

    get sourceHtmlPath(): string | null {
        return this.props.htmlPath?.trim() || null;
    }

    get htmlPath(): string | null {
        if (!this.sourceHtmlPath) {
            return null;
        }

        return `/view/${MINI_LIVRO_SECTION_VIEW_TYPE}/${this.id}`;
    }

    get index(): number {
        return this.props.index ?? 0;
    }

    get htmlAvailable(): boolean {
        return Boolean(this.sourceHtmlPath);
    }

    get isPrefacio(): boolean {
        return this.kind === "prefacio";
    }

    get isEncerramento(): boolean {
        return this.kind === "encerramento";
    }

    toObject(): MiniLivroSectionProps {
        return { ...this.props };
    }
}
