/**
 * Dependency Injection Container (Infrastructure Layer)
 *
 * Container de injeção de dependências para casos de uso.
 * Facilita testes e mantém baixo acoplamento.
 *
 * Princípios aplicados:
 * - DIP: Inverte dependências via injeção
 * - Factory Pattern: Centraliza criação de instâncias
 * - Singleton Pattern: Reutiliza instâncias
 */

import { GetCurrentUserUseCase } from "../../application/usecases/GetCurrentUserUseCase";
import { SignInUseCase } from "../../application/usecases/SignInUseCase";
import { SignOutUseCase } from "../../application/usecases/SignOutUseCase";
import { SignUpUseCase } from "../../application/usecases/SignUpUseCase";
import { supabase } from "../config/supabase";
import { SupabaseAuthRepository } from "../repositories/SupabaseAuthRepository";

/**
 * Container de Dependências
 * Lazy Initialization: Cria instâncias apenas quando necessário
 */
class DIContainer {
    private static authRepositoryInstance: SupabaseAuthRepository | null = null;

    /**
     * Obtém instância do repositório de autenticação
     * Singleton Pattern
     */
    static getAuthRepository(): SupabaseAuthRepository {
        if (!this.authRepositoryInstance) {
            this.authRepositoryInstance = new SupabaseAuthRepository(supabase);
        }
        return this.authRepositoryInstance;
    }

    /**
     * Factory Methods para casos de uso
     * Cada chamada cria nova instância (útil para testes)
     */
    static getSignUpUseCase(): SignUpUseCase {
        return new SignUpUseCase(this.getAuthRepository());
    }

    static getSignInUseCase(): SignInUseCase {
        return new SignInUseCase(this.getAuthRepository());
    }

    static getSignOutUseCase(): SignOutUseCase {
        return new SignOutUseCase(this.getAuthRepository());
    }

    static getCurrentUserUseCase(): GetCurrentUserUseCase {
        return new GetCurrentUserUseCase(this.getAuthRepository());
    }

    /**
     * Reseta container (útil para testes)
     */
    static reset(): void {
        this.authRepositoryInstance = null;
    }
}

export default DIContainer;
