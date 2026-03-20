/**
 * Newsletter Entity (Domain Layer)
 *
 * Representa a entidade de domínio Newsletter seguindo DDD.
 * Inclui fallbacks seguros para dados ausentes ou corrompidos.
 *
 * Princípios aplicados:
 * - DDD: Entidade de domínio com comportamentos do negócio
 * - SRP: Responsável apenas por representar newsletter
 * - Graceful Degradation: Fallbacks para dados ausentes
 * - Immutability: Dados protegidos via getters
 */

export interface NewsletterProps {
    id: number;
    createdAt: Date;
    title: string;
    htmlPath: string | null;
    pdfPath: string | null;
    readTime: number;
    index: number;
}

export class Newsletter {
    private constructor(private readonly props: NewsletterProps) {}

    /**
     * Factory Method para criar Newsletter
     * Design Pattern: Factory Method
     */
    static create(props: NewsletterProps): Newsletter {
        return new Newsletter(props);
    }

    // Getters com fallbacks seguros
    get id(): number {
        return this.props.id ?? 0;
    }

    get title(): string {
        return this.props.title?.trim() || "Material indisponível";
    }

    get htmlPath(): string | null {
        const rawPath = this.props.htmlPath?.trim();
        if (!rawPath) return null;
        const match = rawPath.match(/\/([^/]+)\.html$/);
        if (!match) return rawPath;
        const slug = match[1];
        return `/view/newsletter/${slug}`;
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

    get index(): number {
        return this.props.index;
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
        return this.props.index.toString().padStart(3, "0");
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
    toObject(): NewsletterProps {
        return { ...this.props };
    }
}
