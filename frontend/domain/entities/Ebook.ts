/**
 * Ebook Entity (Domain Layer)
 *
 * Representa a entidade de domínio Ebook seguindo DDD.
 * HTMLPath aponta para a introdução/conteúdo HTML do e-book.
 * PDFPath aponta para o PDF completo ou capa.
 *
 * Princípios aplicados:
 * - DDD: Entidade de domínio com comportamentos do negócio
 * - SRP: Responsável apenas por representar e-book
 * - Graceful Degradation: Fallbacks para dados ausentes
 * - Immutability: Dados protegidos via getters
 */

export interface EbookProps {
    id: number;
    createdAt: Date;
    title: string;
    htmlPath: string | null;
    pdfPath: string | null;
    readTime: number;
}

export class Ebook {
    private constructor(private readonly props: EbookProps) {}

    /**
     * Factory Method para criar Ebook
     * Design Pattern: Factory Method
     */
    static create(props: EbookProps): Ebook {
        return new Ebook(props);
    }

    // Getters com fallbacks seguros
    get id(): number {
        return this.props.id ?? 0;
    }

    get title(): string {
        return this.props.title?.trim() || "E-book indisponível";
    }

    get htmlPath(): string | null {
        const rawPath = this.props.htmlPath?.trim();
        if (!rawPath) return null;
        const match = rawPath.match(/\/([^/]+)\.html$/);
        if (!match) return rawPath;
        const slug = match[1];
        return `/view/ebook/${slug}`;
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

    get htmlAvailable(): boolean {
        return Boolean(this.props.htmlPath?.trim());
    }

    get pdfAvailable(): boolean {
        return Boolean(this.props.pdfPath?.trim());
    }

    get formattedNumber(): string {
        return this.props.id.toString().padStart(3, "0");
    }

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

    toObject(): EbookProps {
        return { ...this.props };
    }
}
