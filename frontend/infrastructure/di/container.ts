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

import { GetBibliotecaUseCase } from "../../application/usecases/GetBibliotecaUseCase";
import { GetCurrentUserUseCase } from "../../application/usecases/GetCurrentUserUseCase";
import { GetMiniLivrosUseCase } from "../../application/usecases/GetMiniLivrosUseCase";
import { GetNewslettersUseCase } from "../../application/usecases/GetNewslettersUseCase";
import { SignInUseCase } from "../../application/usecases/SignInUseCase";
import { SignOutUseCase } from "../../application/usecases/SignOutUseCase";
import { SignUpUseCase } from "../../application/usecases/SignUpUseCase";
import { supabase } from "../config/supabase";
import { SupabaseAuthRepository } from "../repositories/SupabaseAuthRepository";
import { SupabaseBibliotecaRepository } from "../repositories/SupabaseBibliotecaRepository";
import { SupabaseMiniLivroRepository } from "../repositories/SupabaseMiniLivroRepository";
import { SupabaseNewsletterRepository } from "../repositories/SupabaseNewsletterRepository";

/**
 * Container de Dependências
 * Lazy Initialization: Cria instâncias apenas quando necessário
 */
class DIContainer {
    private static authRepositoryInstance: SupabaseAuthRepository | null = null;
    private static newsletterRepositoryInstance: SupabaseNewsletterRepository | null = null;
    private static miniLivroRepositoryInstance: SupabaseMiniLivroRepository | null = null;
    private static bibliotecaRepositoryInstance: SupabaseBibliotecaRepository | null = null;

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
     * Obtém instância do repositório de newsletters
     * Singleton Pattern
     */
    static getNewsletterRepository(): SupabaseNewsletterRepository {
        if (!this.newsletterRepositoryInstance) {
            this.newsletterRepositoryInstance = new SupabaseNewsletterRepository(supabase);
        }
        return this.newsletterRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de mini-livros
     * Singleton Pattern
     */
    static getMiniLivroRepository(): SupabaseMiniLivroRepository {
        if (!this.miniLivroRepositoryInstance) {
            this.miniLivroRepositoryInstance = new SupabaseMiniLivroRepository(supabase);
        }
        return this.miniLivroRepositoryInstance;
    }

    /**
     * Obtém instância do repositório da biblioteca
     * Singleton Pattern
     */
    static getBibliotecaRepository(): SupabaseBibliotecaRepository {
        if (!this.bibliotecaRepositoryInstance) {
            this.bibliotecaRepositoryInstance = new SupabaseBibliotecaRepository(supabase);
        }
        return this.bibliotecaRepositoryInstance;
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
     * Factory Methods para casos de uso de conteúdo
     */
    static getNewslettersUseCase(): GetNewslettersUseCase {
        return new GetNewslettersUseCase(this.getNewsletterRepository());
    }

    static getMiniLivrosUseCase(): GetMiniLivrosUseCase {
        return new GetMiniLivrosUseCase(this.getMiniLivroRepository());
    }

    static getBibliotecaUseCase(): GetBibliotecaUseCase {
        return new GetBibliotecaUseCase(this.getBibliotecaRepository());
    }

    /**
     * Reseta container (útil para testes)
     */
    static reset(): void {
        this.authRepositoryInstance = null;
        this.newsletterRepositoryInstance = null;
        this.miniLivroRepositoryInstance = null;
        this.bibliotecaRepositoryInstance = null;
    }
}

export default DIContainer;
