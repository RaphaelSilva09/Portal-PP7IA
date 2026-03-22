/**
 * BibliotecaItem Entity (Domain Layer)
 *
 * Representa a entidade de domínio BibliotecaItem seguindo DDD.
 * Inclui fallbacks seguros para dados ausentes ou corrompidos.
 *
 * Princípios aplicados:
 * - DDD: Entidade de domínio com comportamentos do negócio
 * - SRP: Responsável apenas por representar item da biblioteca
 * - Graceful Degradation: Fallbacks para dados ausentes
 * - Immutability: Dados protegidos via getters
 */

export type BibliotecaTema =
    | "biblioteca-dos-7"
    | "saude"
    | "investimentos-financas"
    | "viagens-restaurantes"
    | "tecnologia"
    | "prompts"
    | "diversos";

export const BIBLIOTECA_TEMAS: { slug: BibliotecaTema; label: string }[] = [
    { slug: "biblioteca-dos-7",       label: "Biblioteca dos 7"         },
    { slug: "saude",                   label: "Saúde"                    },
    { slug: "investimentos-financas",  label: "Investimentos | Finanças"  },
    { slug: "viagens-restaurantes",    label: "Viagens | Restaurantes"   },
    { slug: "tecnologia",              label: "Tecnologia"               },
    { slug: "prompts",                 label: "Prompts"                  },
    { slug: "diversos",                label: "Diversos"                 },
];

export interface BibliotecaItemProps {
    id: number;
    createdAt: Date;
    title: string;
    htmlPath: string | null;
    pdfPath: string | null;
    readTime: number;
    tema: BibliotecaTema;
    index: number;
}

export class BibliotecaItem {
    private constructor(private readonly props: BibliotecaItemProps) {}

    /**
     * Factory Method para criar BibliotecaItem
     * Design Pattern: Factory Method
     */
    static create(props: BibliotecaItemProps): BibliotecaItem {
        return new BibliotecaItem(props);
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
        return `/view/biblioteca/${slug}`;
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

    get tema(): BibliotecaTema {
        return this.props.tema ?? "diversos";
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
    toObject(): BibliotecaItemProps {
        return { ...this.props };
    }
}
