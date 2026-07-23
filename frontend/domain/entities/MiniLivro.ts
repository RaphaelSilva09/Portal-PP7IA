/**
 * MiniLivro Entity (Domain Layer)
 *
 * Representa a entidade de domínio MiniLivro seguindo DDD.
 * Inclui fallbacks seguros para dados ausentes ou corrompidos.
 *
 * Princípios aplicados:
 * - DDD: Entidade de domínio com comportamentos do negócio
 * - SRP: Responsável apenas por representar mini-livro
 * - Graceful Degradation: Fallbacks para dados ausentes
 * - Immutability: Dados protegidos via getters
 */

import { publicFileUrl } from "@/lib/files";

export interface MiniLivroProps {
    id: number;
    createdAt: Date;
    updatedAt?: Date | null;
    title: string;
    htmlPath: string | null;
    pdfPath: string | null;
    readTime: number;
    /** ID do ebook ao qual este mini-livro pertence (FK para ebooks.id) */
    ebookId: number | null;
    index: number;
    /** Parte à qual o mini-livro pertence (1=Parte I, 2=Parte II, 3=Parte III) */
    partOrder: number;
}

export class MiniLivro {
    private constructor(private readonly props: MiniLivroProps) {}

    /**
     * Factory Method para criar MiniLivro
     * Design Pattern: Factory Method
     */
    static create(props: MiniLivroProps): MiniLivro {
        return new MiniLivro(props);
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
        return `/view/mini-livro/${slug}`;
    }

    get pdfPath(): string | null {
        return publicFileUrl(this.props.pdfPath);
    }

    get readTime(): number {
        return this.props.readTime ?? 5;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get ebookId(): number | null {
        return this.props.ebookId ?? null;
    }

    get index(): number {
        return this.props.index;
    }

    get partOrder(): number {
        return this.props.partOrder ?? 1;
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
        return this.props.index.toString().padStart(2, "0");
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
    get updatedAt(): Date | null {
        return this.props.updatedAt ?? null;
    }

    toObject(): MiniLivroProps {
        return { ...this.props };
    }
}
