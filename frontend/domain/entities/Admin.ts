/**
 * Admin Entity (Domain Layer)
 *
 * Representa a entidade de domínio Admin seguindo DDD.
 * Um admin é um usuário com permissões especiais no sistema.
 *
 * Princípios aplicados:
 * - DDD: Entidade de domínio com identidade
 * - SRP: Responsável apenas por representar admin
 * - Immutability: Dados protegidos via getters
 */

export interface AdminProps {
    id: string;
    createdAt: Date;
}

export class Admin {
    private constructor(private readonly props: AdminProps) {}

    /**
     * Factory Method para criar Admin
     * Design Pattern: Factory Method
     */
    static create(props: AdminProps): Admin {
        return new Admin(props);
    }

    get id(): string {
        return this.props.id;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    /**
     * Converte para objeto plano (DTO)
     */
    toObject(): AdminProps {
        return { ...this.props };
    }
}
