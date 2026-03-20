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
    subtitle: string | null;
    description: string | null;
    coverImagePath: string | null;
    coverPdfPath: string | null;
    introHtmlPath: string | null;
    introPdfPath: string | null;
    badgeText: string | null;
    readTime: number;
    order: number;
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

    get subtitle(): string | null {
        return this.props.subtitle?.trim() || null;
    }

    get description(): string | null {
        return this.props.description?.trim() || null;
    }

    get coverImagePath(): string | null {
        return this.props.coverImagePath?.trim() || null;
    }

    get coverPdfPath(): string | null {
        return this.props.coverPdfPath?.trim() || null;
    }

    get introHtmlPath(): string | null {
        const rawPath = this.props.introHtmlPath?.trim();
        if (!rawPath) return null;
        
        // Se for um HTML hospedado no Supabase Storage (final .html)
        // usamos a rota interna /view proxy do Next.js
        if (rawPath.endsWith('.html')) {
            const match = rawPath.match(/\/([^/]+)\.html$/);
            if (match) {
                const slug = match[1];
                return `/view/ebook/${slug}`;
            }
        }
        
        // Caso contrário (ex: um PDF ou link externo), devolve cru
        return rawPath;
    }

    get introPdfPath(): string | null {
        return this.props.introPdfPath?.trim() || null;
    }

    get badgeText(): string | null {
        return this.props.badgeText?.trim() || null;
    }

    get readTime(): number {
        return this.props.readTime ?? 5;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get order(): number {
        return this.props.order ?? 0;
    }

    get htmlAvailable(): boolean {
        return Boolean(this.props.introHtmlPath?.trim());
    }

    get coverPdfAvailable(): boolean {
        return Boolean(this.props.coverPdfPath?.trim());
    }

    get introPdfAvailable(): boolean {
        return Boolean(this.props.introPdfPath?.trim());
    }

    get formattedNumber(): string {
        return this.props.order.toString().padStart(3, "0");
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
