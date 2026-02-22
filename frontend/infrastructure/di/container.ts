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
import { DeleteUserAndDataUseCase } from "../../application/usecases/DeleteUserAndDataUseCase";
import { DemoteUserFromAdminUseCase } from "../../application/usecases/DemoteUserFromAdminUseCase";
import { GetAllUsersUseCase } from "../../application/usecases/GetAllUsersUseCase";
import { GetBibliotecaUseCase } from "../../application/usecases/GetBibliotecaUseCase";
import { GetCurrentUserUseCase } from "../../application/usecases/GetCurrentUserUseCase";
import { GetDashboardStatsUseCase } from "../../application/usecases/GetDashboardStatsUseCase";
import { GetMiniLivrosUseCase } from "../../application/usecases/GetMiniLivrosUseCase";
import { GetNewslettersUseCase } from "../../application/usecases/GetNewslettersUseCase";
import { PromoteUserToAdminUseCase } from "../../application/usecases/PromoteUserToAdminUseCase";
import { ResetPasswordWithTokenUseCase } from "../../application/usecases/ResetPasswordWithTokenUseCase";
import { SendPasswordResetUseCase } from "../../application/usecases/SendPasswordResetUseCase";
import { SignInUseCase } from "../../application/usecases/SignInUseCase";
import { SignOutUseCase } from "../../application/usecases/SignOutUseCase";
import { SignUpUseCase } from "../../application/usecases/SignUpUseCase";
import { UpdateContentWithFilesUseCase } from "../../application/usecases/UpdateContentWithFilesUseCase";
import { VerifyPasswordResetOTPUseCase } from "../../application/usecases/VerifyPasswordResetOTPUseCase";
import { supabase } from "../config/supabase";
import { SupabaseAdminRepository } from "../repositories/SupabaseAdminRepository";
import { SupabaseAnalyticsRepository } from "../repositories/SupabaseAnalyticsRepository";
import { SupabaseAuthRepository } from "../repositories/SupabaseAuthRepository";
import { SupabaseBibliotecaRepository } from "../repositories/SupabaseBibliotecaRepository";
import { SupabaseContentRepository } from "../repositories/SupabaseContentRepository";
import { SupabaseEspecialSemanaRepository } from "../repositories/SupabaseEspecialSemanaRepository";
import { SupabaseMiniLivroRepository } from "../repositories/SupabaseMiniLivroRepository";
import { SupabaseNewsletterRepository } from "../repositories/SupabaseNewsletterRepository";
import { SupabaseStorageRepository } from "../repositories/SupabaseStorageRepository";
import { SupabaseUserManagementRepository } from "../repositories/SupabaseUserManagementRepository";

/**
 * Container de Dependências
 * Lazy Initialization: Cria instâncias apenas quando necessário
 */
class DIContainer {
    private static authRepositoryInstance: SupabaseAuthRepository | null = null;
    private static newsletterRepositoryInstance: SupabaseNewsletterRepository | null = null;
    private static miniLivroRepositoryInstance: SupabaseMiniLivroRepository | null = null;
    private static bibliotecaRepositoryInstance: SupabaseBibliotecaRepository | null = null;
    private static especialSemanaRepositoryInstance: SupabaseEspecialSemanaRepository | null = null;
    private static adminRepositoryInstance: SupabaseAdminRepository | null = null;
    private static contentRepositoryInstance: SupabaseContentRepository | null = null;
    private static storageRepositoryInstance: SupabaseStorageRepository | null = null;
    private static userManagementRepositoryInstance: SupabaseUserManagementRepository | null = null;
    private static analyticsRepositoryInstance: SupabaseAnalyticsRepository | null = null;

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
     * Obtém instância do repositório de especial da semana
     * Singleton Pattern
     */
    static getEspecialSemanaRepository(): SupabaseEspecialSemanaRepository {
        if (!this.especialSemanaRepositoryInstance) {
            this.especialSemanaRepositoryInstance = new SupabaseEspecialSemanaRepository(supabase);
        }
        return this.especialSemanaRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de gerenciamento de usuários
     * Singleton Pattern
     */
    static getUserManagementRepository(): SupabaseUserManagementRepository {
        if (!this.userManagementRepositoryInstance) {
            this.userManagementRepositoryInstance = new SupabaseUserManagementRepository(supabase);
        }
        return this.userManagementRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de analytics
     * Singleton Pattern
     */
    static getAnalyticsRepository(): SupabaseAnalyticsRepository {
        if (!this.analyticsRepositoryInstance) {
            this.analyticsRepositoryInstance = new SupabaseAnalyticsRepository(supabase);
        }
        return this.analyticsRepositoryInstance;
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
    static getEspecialSemanaUseCase(): GetEspecialSemanaUseCase {
        return new GetEspecialSemanaUseCase(this.getEspecialSemanaRepository());
    }

    /**
     * Factory Methods para casos de uso de admin
     */
    static getCreateContentWithUploadUseCase(): CreateContentWithUploadUseCase {
        return new CreateContentWithUploadUseCase(this.getContentRepository(), this.getStorageRepository());
    }

    static getUpdateContentWithFilesUseCase(): UpdateContentWithFilesUseCase {
        return new UpdateContentWithFilesUseCase(this.getContentRepository(), this.getStorageRepository());
    }

    static getDeleteContentWithFilesUseCase(): DeleteContentWithFilesUseCase {
        return new DeleteContentWithFilesUseCase(this.getContentRepository(), this.getStorageRepository());
    }

    /**
     * Factory Methods para casos de uso de gerenciamento de usuários
     */
    static getAllUsersUseCase(): GetAllUsersUseCase {
        return new GetAllUsersUseCase(this.getUserManagementRepository());
    }

    static getPromoteUserToAdminUseCase(): PromoteUserToAdminUseCase {
        return new PromoteUserToAdminUseCase(this.getUserManagementRepository());
    }

    static getDemoteUserFromAdminUseCase(): DemoteUserFromAdminUseCase {
        return new DemoteUserFromAdminUseCase(this.getUserManagementRepository());
    }

    static getDeleteUserAndDataUseCase(): DeleteUserAndDataUseCase {
        return new DeleteUserAndDataUseCase(this.getUserManagementRepository());
    }

    /**
     * Factory Methods para casos de uso de analytics
     */
    static getDashboardStatsUseCase(): GetDashboardStatsUseCase {
        return new GetDashboardStatsUseCase(this.getAnalyticsRepository());
    }

    static getCurrentUserUseCase(): GetCurrentUserUseCase {
        return new GetCurrentUserUseCase(this.getAuthRepository());
    }

    static getSignInUseCase(): SignInUseCase {
        return new SignInUseCase(this.getAuthRepository());
    }

    static getSignOutUseCase(): SignOutUseCase {
        return new SignOutUseCase(this.getAuthRepository());
    }

    static getSignUpUseCase(): SignUpUseCase {
        return new SignUpUseCase(this.getAuthRepository());
    }

    static getSendPasswordResetUseCase(): SendPasswordResetUseCase {
        return new SendPasswordResetUseCase(this.getAuthRepository());
    }

    static getVerifyPasswordResetOTPUseCase(): VerifyPasswordResetOTPUseCase {
        return new VerifyPasswordResetOTPUseCase(this.getAuthRepository());
    }

    static getResetPasswordWithTokenUseCase(): ResetPasswordWithTokenUseCase {
        return new ResetPasswordWithTokenUseCase(this.getAuthRepository());
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
        this.especialSemanaRepositoryInstance = null;
        this.adminRepositoryInstance = null;
        this.contentRepositoryInstance = null;
        this.storageRepositoryInstance = null;
        this.userManagementRepositoryInstance = null;
        this.analyticsRepositoryInstance = null;
    }
}

export default DIContainer;
