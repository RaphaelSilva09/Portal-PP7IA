/**
 * Estudar Entity (Domain Layer)
 *
 * Representa a entidade de domínio Estudar seguindo DDD.
 * Inclui fallbacks seguros para dados ausentes ou corrompidos.
 *
 * Princípios aplicados:
 * - DDD: Entidade de domínio com comportamentos do negócio
 * - SRP: Responsável apenas por representar conteúdo de estudo
 * - Graceful Degradation: Fallbacks para dados ausentes
 * - Immutability: Dados protegidos via getters
 */

import { publicFileUrl } from "@/lib/files";

export interface EstudarProps {
    id: number;
    createdAt: Date;
    updatedAt?: Date | null;
    title: string;
    htmlPath: string | null;
    pdfPath: string | null;
    readTime: number;
    index: number;
}

export class Estudar {
    private constructor(private readonly props: EstudarProps) {}

    /**
     * Factory Method para criar Estudar
     * Design Pattern: Factory Method
     */
    static create(props: EstudarProps): Estudar {
        return new Estudar(props);
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
        return `/view/estudar/${slug}`;
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

    get index(): number {
        return this.props.index;
    }

    get htmlAvailable(): boolean {
        return Boolean(this.props.htmlPath?.trim());
    }

    get pdfAvailable(): boolean {
        return Boolean(this.props.pdfPath?.trim());
    }

    get formattedNumber(): string {
        return this.props.index.toString().padStart(3, "0");
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

    get updatedAt(): Date | null {
        return this.props.updatedAt ?? null;
    }

    toObject(): EstudarProps {
        return { ...this.props };
    }
}
