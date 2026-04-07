/**
 * ContentItem Entity (Domain Layer)
 *
 * Entidade genérica para conteúdo (Newsletter, MiniLivro, Biblioteca).
 * Usada no contexto admin para operações CRUD unificadas.
 *
 * Princípios aplicados:
 * - DRY: Evita duplicação de código entre entidades similares
 * - DDD: Entidade de domínio com comportamentos
 * - Graceful Degradation: Fallbacks para dados ausentes
 * - Immutability: Dados protegidos via getters
 */

export type ContentType =
    | "newsletter"
    | "mini-livro"
    | "biblioteca"
    | "especial-semana"
    | "radar_oportunidades"
    | "estudar"
    | "ebook";

export interface ContentItemProps {
    id: number;
    createdAt: Date;
    title: string;
    htmlPath: string | null;
    pdfPath: string | null;
    readTime: number;
    index?: number;
    // MiniLivro-specific fields
    /** ID do ebook ao qual este mini-livro pertence (FK para ebooks.id) */
    ebookId?: number | null;
    // Biblioteca-specific fields
    tema?: string | null;
    // Ebook-specific fields
    subtitle?: string | null;
    description?: string | null;
    badgeText?: string | null;
    coverImagePath?: string | null;
    coverPdfPath?: string | null;
}

export class ContentItem {
    private constructor(private readonly props: ContentItemProps) {}

    /**
     * Factory Method para criar ContentItem
     * Design Pattern: Factory Method
     */
    static create(props: ContentItemProps): ContentItem {
        return new ContentItem(props);
    }

    get id(): number {
        return this.props.id ?? 0;
    }

    get title(): string {
        return this.props.title?.trim() || "Material indisponível";
    }

    get htmlPath(): string | null {
        return this.props.htmlPath?.trim() || null;
    }

    get pdfPath(): string | null {
        return this.props.pdfPath?.trim() || null;
    }

    get readTime(): number {
        return this.props.readTime ?? 5;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    /**
     * Verifica se HTML está disponível
     */
    get htmlAvailable(): boolean {
        return Boolean(this.props.htmlPath?.trim());
    }

    /**
     * Verifica se PDF está disponível
     */
    get pdfAvailable(): boolean {
        return Boolean(this.props.pdfPath?.trim());
    }

    // Biblioteca-specific getters
    get tema(): string | null {
        return this.props.tema?.trim() || null;
    }

    // Ebook-specific getters
    get subtitle(): string | null {
        return this.props.subtitle?.trim() || null;
    }

    get description(): string | null {
        return this.props.description?.trim() || null;
    }

    get badgeText(): string | null {
        return this.props.badgeText?.trim() || null;
    }

    get coverImagePath(): string | null {
        return this.props.coverImagePath?.trim() || null;
    }

    get coverPdfPath(): string | null {
        return this.props.coverPdfPath?.trim() || null;
    }

    get index(): number {
        return this.props.index ?? 0;
    }

    get ebookId(): number | null {
        return this.props.ebookId ?? null;
    }

    /**
     * Retorna número formatado com padding (ex: "001")
     * Usa o índice de edição quando disponível, caso contrário usa o ID.
     */
    get formattedNumber(): string {
        const num = this.props.index ?? this.props.id ?? 0;
        return num.toString().padStart(3, "0");
    }

    /**
     * Retorna data formatada em pt-BR
     * Fallback: "Data indisponível"
     */
    get formattedDate(): string {
        try {
            if (!this.props.createdAt) return "Data indisponível";
            const date = this.props.createdAt instanceof Date ? this.props.createdAt : new Date(this.props.createdAt);
            if (isNaN(date.getTime())) return "Data indisponível";
            return date.toLocaleDateString("pt-BR");
        } catch {
            return "Data indisponível";
        }
    }

    /**
     * Converte para objeto plano (DTO)
     */
    toObject(): ContentItemProps {
        return { ...this.props };
    }
}
