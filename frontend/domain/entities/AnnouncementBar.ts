/**
 * AnnouncementBar Entity (Domain Layer)
 *
 * Entidade de domínio para barras de aviso exibidas no topo das páginas.
 *
 * Princípios aplicados:
 * - DDD: Entidade de domínio com comportamentos do negócio
 * - SRP: Responsável apenas por representar uma barra de aviso
 * - Graceful Degradation: Fallbacks para dados ausentes
 * - Immutability: Dados protegidos via getters
 */

export interface AnnouncementBarProps {
    id: string;
    message: string;
    linkUrl: string | null;
    linkLabel: string | null;
    bgColor: string;
    textColor: string;
    isActive: boolean;
    priority: number;
    startsAt: Date | null;
    endsAt: Date | null;
    isClosable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class AnnouncementBar {
    private constructor(private readonly props: AnnouncementBarProps) {}

    /**
     * Factory Method para criar AnnouncementBar
     * Design Pattern: Factory Method
     */
    static create(props: AnnouncementBarProps): AnnouncementBar {
        return new AnnouncementBar(props);
    }

    get id(): string {
        return this.props.id;
    }

    get message(): string {
        return this.props.message?.trim() || "";
    }

    get linkUrl(): string | null {
        return this.props.linkUrl?.trim() || null;
    }

    get linkLabel(): string | null {
        return this.props.linkLabel?.trim() || null;
    }

    get bgColor(): string {
        return this.props.bgColor?.trim() || "#1a1a1a";
    }

    get textColor(): string {
        return this.props.textColor?.trim() || "#ffffff";
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    get priority(): number {
        return this.props.priority ?? 0;
    }

    get startsAt(): Date | null {
        return this.props.startsAt;
    }

    get endsAt(): Date | null {
        return this.props.endsAt;
    }

    get isClosable(): boolean {
        return this.props.isClosable;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    /**
     * Verifica se a barra deve ser exibida agora (considerando janela de tempo)
     * Filtra client-side após busca; evita round-trip adicional ao banco.
     */
    isLive(now: Date = new Date()): boolean {
        if (!this.props.isActive) return false;
        if (this.props.startsAt && now < this.props.startsAt) return false;
        if (this.props.endsAt && now > this.props.endsAt) return false;
        return true;
    }

    /**
     * Converte para objeto plano (DTO)
     */
    toObject(): AnnouncementBarProps {
        return { ...this.props };
    }
}
