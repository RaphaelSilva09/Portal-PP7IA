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

import { CreateContentWithUploadUseCase } from "../../application/usecases/CreateContentWithUploadUseCase";
import { DeleteContentWithFilesUseCase } from "../../application/usecases/DeleteContentWithFilesUseCase";
import { GetBibliotecaUseCase } from "../../application/usecases/GetBibliotecaUseCase";
import { GetCurrentUserUseCase } from "../../application/usecases/GetCurrentUserUseCase";
import { GetMiniLivrosUseCase } from "../../application/usecases/GetMiniLivrosUseCase";
import { GetNewslettersUseCase } from "../../application/usecases/GetNewslettersUseCase";
import { SignInUseCase } from "../../application/usecases/SignInUseCase";
import { SignOutUseCase } from "../../application/usecases/SignOutUseCase";
import { SignUpUseCase } from "../../application/usecases/SignUpUseCase";
import { supabase } from "../config/supabase";
import { SupabaseAdminRepository } from "../repositories/SupabaseAdminRepository";
import { SupabaseAuthRepository } from "../repositories/SupabaseAuthRepository";
import { SupabaseBibliotecaRepository } from "../repositories/SupabaseBibliotecaRepository";
import { SupabaseContentRepository } from "../repositories/SupabaseContentRepository";
import { SupabaseMiniLivroRepository } from "../repositories/SupabaseMiniLivroRepository";
import { SupabaseNewsletterRepository } from "../repositories/SupabaseNewsletterRepository";
import { SupabaseStorageRepository } from "../repositories/SupabaseStorageRepository";

/**
 * Container de Dependências
 * Lazy Initialization: Cria instâncias apenas quando necessário
 */
class DIContainer {
    private static authRepositoryInstance: SupabaseAuthRepository | null = null;
    private static newsletterRepositoryInstance: SupabaseNewsletterRepository | null = null;
    private static miniLivroRepositoryInstance: SupabaseMiniLivroRepository | null = null;
    private static bibliotecaRepositoryInstance: SupabaseBibliotecaRepository | null = null;
    private static adminRepositoryInstance: SupabaseAdminRepository | null = null;
    private static contentRepositoryInstance: SupabaseContentRepository | null = null;
    private static storageRepositoryInstance: SupabaseStorageRepository | null = null;

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
     * Obtém instância do repositório de admin
     * Singleton Pattern
     */
    static getAdminRepository(): SupabaseAdminRepository {
        if (!this.adminRepositoryInstance) {
            this.adminRepositoryInstance = new SupabaseAdminRepository();
        }
        return this.adminRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de conteúdo genérico
     * Singleton Pattern
     */
    static getContentRepository(): SupabaseContentRepository {
        if (!this.contentRepositoryInstance) {
            this.contentRepositoryInstance = new SupabaseContentRepository();
        }
        return this.contentRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de storage
     * Singleton Pattern
     */
    static getStorageRepository(): SupabaseStorageRepository {
        if (!this.storageRepositoryInstance) {
            this.storageRepositoryInstance = new SupabaseStorageRepository();
        }
        return this.storageRepositoryInstance;
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
     * Factory Methods para casos de uso de admin
     */
    static getCreateContentWithUploadUseCase(): CreateContentWithUploadUseCase {
        return new CreateContentWithUploadUseCase(
            this.getContentRepository(),
            this.getStorageRepository()
        );
    }

    static getDeleteContentWithFilesUseCase(): DeleteContentWithFilesUseCase {
        return new DeleteContentWithFilesUseCase(
            this.getContentRepository(),
            this.getStorageRepository()
        );
    }

    /**
     * Reseta container (útil para testes)
     */
    static reset(): void {
        this.authRepositoryInstance = null;
        this.newsletterRepositoryInstance = null;
        this.miniLivroRepositoryInstance = null;
        this.bibliotecaRepositoryInstance = null;
        this.adminRepositoryInstance = null;
        this.contentRepositoryInstance = null;
        this.storageRepositoryInstance = null;
    }
}

export default DIContainer;
