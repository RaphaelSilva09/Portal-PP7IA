/**
 * User Entity (Domain Layer)
 *
 * Representa a entidade de domínio User seguindo DDD.
 * Esta entidade contém apenas dados e comportamentos relacionados ao domínio.
 *
 * Princípios aplicados:
 * - DDD: Entidade de domínio rica com validações de negócio
 * - SRP: Responsável apenas por representar e validar um usuário
 * - Immutability: Dados protegidos, alterações geram novo objeto
 */

export interface UserProps {
    id: string;
    email: string;
    nome: string;
    celular: string;
    acceptEmailUpdates: boolean;
    acceptWhatsAppUpdates: boolean;
    createdAt: Date;
}

export class User {
    private constructor(private readonly props: UserProps) {
        this.validate();
    }

    /**
     * Factory Method para criar usuário
     * Design Pattern: Factory Method
     */
    static create(props: UserProps): User {
        return new User(props);
    }

    /**
     * Validação de regras de negócio
     * Tell, Don't Ask: Entidade se auto-valida
     */
    private validate(): void {
        if (!this.props.email || !this.isValidEmail(this.props.email)) {
            throw new Error("Email inválido");
        }

        if (!this.props.nome || this.props.nome.trim().length === 0) {
            throw new Error("Nome é obrigatório");
        }

        if (!this.props.celular || !this.isValidPhone(this.props.celular)) {
            throw new Error("Celular inválido");
        }

        if (!this.props.acceptEmailUpdates && !this.props.acceptWhatsAppUpdates) {
            throw new Error("Usuário deve aceitar pelo menos uma forma de comunicação");
        }
    }

    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    private isValidPhone(phone: string): boolean {
        const cleanPhone = phone.replace(/\D/g, "");
        return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    }

    // Getters (Value Objects Pattern)
    get id(): string {
        return this.props.id;
    }

    get email(): string {
        return this.props.email;
    }

    get nome(): string {
        return this.props.nome;
    }

    get celular(): string {
        return this.props.celular;
    }

    get acceptEmailUpdates(): boolean {
        return this.props.acceptEmailUpdates;
    }

    get acceptWhatsAppUpdates(): boolean {
        return this.props.acceptWhatsAppUpdates;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    /**
     * Converte para objeto plano (DTO)
     * Útil para serialização
     */
    toObject(): UserProps {
        return { ...this.props };
    }
}
