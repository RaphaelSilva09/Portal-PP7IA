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

export type ContentType = "newsletter" | "mini-livro" | "biblioteca";

export interface ContentItemProps {
    id: number;
    createdAt: Date;
    title: string;
    htmlPath: string | null;
    pdfPath: string | null;
    readTime: number | null;
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

    get readTime(): number | null {
        return this.props.readTime;
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

    /**
     * Retorna número formatado com padding (ex: "001")
     */
    get formattedNumber(): string {
        const id = this.props.id ?? 0;
        return id.toString().padStart(3, "0");
    }

    /**
     * Retorna data formatada em pt-BR
     * Fallback: "Data indisponível"
     */
    get formattedDate(): string {
        try {
            if (!this.props.createdAt) return "Data indisponível";
            const date =
                this.props.createdAt instanceof Date
                    ? this.props.createdAt
                    : new Date(this.props.createdAt);
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
