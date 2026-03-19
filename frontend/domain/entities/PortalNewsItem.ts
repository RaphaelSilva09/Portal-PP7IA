/**
 * PortalNewsItem Entity (Domain Layer)
 *
 * Representa a entidade de domínio de uma novidade do portal.
 *
 * Princípios aplicados:
 * - DDD: Entidade de domínio com comportamentos do negócio
 * - SRP: Responsável apenas por representar uma novidade
 * - Graceful Degradation: Fallbacks para dados ausentes
 * - Immutability: Dados protegidos via getters
 */

export type PortalNewsCategory = "launch" | "newsletter" | "content" | "tool";

export interface PortalNewsItemProps {
    id: string;
    title: string;
    description: string | null;
    icon: string;
    category: PortalNewsCategory;
    accentColor: string | null;
    publishedAt: Date;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    linkType: string | null;
    linkItemId: number | null;
}

/**
 * Cores padrão por categoria — usadas como fallback se accent_color for nulo
 */
export const CATEGORY_DEFAULT_COLORS: Record<PortalNewsCategory, string> = {
    launch:     "#f97316",
    newsletter: "#22c55e",
    content:    "#ec4899",
    tool:       "#eab308",
};

export class PortalNewsItem {
    private constructor(private readonly props: PortalNewsItemProps) {}

    /**
     * Factory Method para criar PortalNewsItem
     * Design Pattern: Factory Method
     */
    static create(props: PortalNewsItemProps): PortalNewsItem {
        return new PortalNewsItem(props);
    }

    get id(): string {
        return this.props.id;
    }

    get title(): string {
        return this.props.title?.trim() || "Novidade indisponível";
    }

    get description(): string | null {
        return this.props.description?.trim() || null;
    }

    get icon(): string {
        return this.props.icon?.trim() || "📌";
    }

    get category(): PortalNewsCategory {
        return this.props.category;
    }

    /**
     * Retorna a cor de destaque, usando o padrão da categoria como fallback
     */
    get accentColor(): string {
        return this.props.accentColor?.trim() || CATEGORY_DEFAULT_COLORS[this.props.category];
    }

    get publishedAt(): Date {
        return this.props.publishedAt;
    }

    get displayOrder(): number {
        return this.props.displayOrder ?? 0;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    get linkType(): string | null {
        return this.props.linkType;
    }

    get linkItemId(): number | null {
        return this.props.linkItemId;
    }

    get linkUrl(): string | null {
        if (!this.props.linkType || !this.props.linkItemId) return null;
        const routes: Record<string, string> = {
            "newsletter":          "/newsletter",
            "mini-livro":          "/mini-livros",
            "biblioteca":          "/biblioteca",
            "especial-semana":     "/especial-semana",
            "radar-oportunidades": "/radar-oportunidades",
            "estudar":             "/estudar",
        };
        const page = routes[this.props.linkType];
        return page ? `${page}#item-${this.props.linkItemId}` : null;
    }

    /**
     * Retorna data de publicação formatada: "DD.MM.AAAA"
     * Fallback: "Data indisponível"
     */
    get formattedDate(): string {
        try {
            if (!this.props.publishedAt) return "Data indisponível";
            const date =
                this.props.publishedAt instanceof Date
                    ? this.props.publishedAt
                    : new Date(this.props.publishedAt);
            if (isNaN(date.getTime())) return "Data indisponível";
            const day   = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year  = date.getFullYear();
            return `${day}.${month}.${year}`;
        } catch {
            return "Data indisponível";
        }
    }

    /**
     * Converte para objeto plano (DTO)
     */
    toObject(): PortalNewsItemProps {
        return { ...this.props };
    }
}
