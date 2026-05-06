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

import { CreateAnnouncementBarUseCase } from "../../application/usecases/CreateAnnouncementBarUseCase";
import { DeleteAnnouncementBarUseCase } from "../../application/usecases/DeleteAnnouncementBarUseCase";
import { GetAnnouncementBarsUseCase } from "../../application/usecases/GetAnnouncementBarsUseCase";
import { ToggleAnnouncementBarUseCase } from "../../application/usecases/ToggleAnnouncementBarUseCase";
import { UpdateAnnouncementBarUseCase } from "../../application/usecases/UpdateAnnouncementBarUseCase";
import { CreateContentWithUploadUseCase } from "../../application/usecases/CreateContentWithUploadUseCase";
import { DeleteContentWithFilesUseCase } from "../../application/usecases/DeleteContentWithFilesUseCase";
import { DeleteUserAndDataUseCase } from "../../application/usecases/DeleteUserAndDataUseCase";
import { DemoteUserFromAdminUseCase } from "../../application/usecases/DemoteUserFromAdminUseCase";
import { GetActiveBookUseCase } from "../../application/usecases/GetActiveBookUseCase";
import { GetUsersUseCase } from "../../application/usecases/GetAllUsersUseCase";
import { GetTodayRegistrationsUseCase } from "../../application/usecases/GetTodayRegistrationsUseCase";
import { GetBibliotecaUseCase } from "../../application/usecases/GetBibliotecaUseCase";
import { GetContentViewNavigationUseCase } from "../../application/usecases/GetContentViewNavigationUseCase";
import { GetCurrentUserUseCase } from "../../application/usecases/GetCurrentUserUseCase";
import { GetDashboardStatsUseCase } from "../../application/usecases/GetDashboardStatsUseCase";
import { GetEbookUseCase } from "../../application/usecases/GetEbookUseCase";
import { GetEditorialUseCase } from "../../application/usecases/GetEditorialUseCase";
import { GetEspecialSemanaUseCase } from "../../application/usecases/GetEspecialSemanaUseCase";
import { GetEstudarUseCase } from "../../application/usecases/GetEstudarUseCase";
import { GetMiniLivrosUseCase } from "../../application/usecases/GetMiniLivrosUseCase";
import { GetNewslettersUseCase } from "../../application/usecases/GetNewslettersUseCase";
import { GetPortalNewsUseCase } from "../../application/usecases/GetPortalNewsUseCase";
import { GetRadarOportunidadesUseCase } from "../../application/usecases/GetRadarOportunidadesUseCase";
import { PromoteUserToAdminUseCase } from "../../application/usecases/PromoteUserToAdminUseCase";
import { ResetPasswordWithTokenUseCase } from "../../application/usecases/ResetPasswordWithTokenUseCase";
import { SaveEditorialUseCase } from "../../application/usecases/SaveEditorialUseCase";
import { SearchContentUseCase } from "../../application/usecases/SearchContentUseCase";
import { SendPasswordResetUseCase } from "../../application/usecases/SendPasswordResetUseCase";
import { SignInUseCase } from "../../application/usecases/SignInUseCase";
import { SignOutUseCase } from "../../application/usecases/SignOutUseCase";
import { SignUpUseCase } from "../../application/usecases/SignUpUseCase";
import { UpdateContentWithFilesUseCase } from "../../application/usecases/UpdateContentWithFilesUseCase";
import { VerifyPasswordResetOTPUseCase } from "../../application/usecases/VerifyPasswordResetOTPUseCase";
import { supabase, supabaseAnon } from "../config/supabase";
import { SupabaseAnnouncementBarRepository } from "../repositories/SupabaseAnnouncementBarRepository";
import { SupabaseAdminRepository } from "../repositories/SupabaseAdminRepository";
import { SupabaseAnalyticsRepository } from "../repositories/SupabaseAnalyticsRepository";
import { BetterAuthRepository } from "../repositories/BetterAuthRepository";
import { SupabaseAuthRepository } from "../repositories/SupabaseAuthRepository";
import { SupabaseBibliotecaRepository } from "../repositories/SupabaseBibliotecaRepository";
import { SupabaseBookRepository } from "../repositories/SupabaseBookRepository";
import { SupabaseContentRepository } from "../repositories/SupabaseContentRepository";
import { SupabaseEbookRepository } from "../repositories/SupabaseEbookRepository";
import { SupabaseEditorialRepository } from "../repositories/SupabaseEditorialRepository";
import { SupabaseEspecialSemanaRepository } from "../repositories/SupabaseEspecialSemanaRepository";
import { SupabaseEstudarRepository } from "../repositories/SupabaseEstudarRepository";
import { SupabaseHomeDatesRepository } from "../repositories/SupabaseHomeDatesRepository";
import { SupabaseMiniLivroRepository } from "../repositories/SupabaseMiniLivroRepository";
import { SupabaseNewsletterRepository } from "../repositories/SupabaseNewsletterRepository";
import { SupabasePortalNewsRepository } from "../repositories/SupabasePortalNewsRepository";
import { SupabaseRadarOportunidadesRepository } from "../repositories/SupabaseRadarOportunidadesRepository";
import { SupabaseStorageRepository } from "../repositories/SupabaseStorageRepository";
import { SupabaseUserManagementRepository } from "../repositories/SupabaseUserManagementRepository";

/**
 * Container de Dependências
 * Lazy Initialization: Cria instâncias apenas quando necessário
 */
class DIContainer {
    private static authRepositoryInstance: BetterAuthRepository | null = null;
    private static newsletterRepositoryInstance: SupabaseNewsletterRepository | null = null;
    private static miniLivroRepositoryInstance: SupabaseMiniLivroRepository | null = null;
    private static bibliotecaRepositoryInstance: SupabaseBibliotecaRepository | null = null;
    private static especialSemanaRepositoryInstance: SupabaseEspecialSemanaRepository | null = null;
    private static radarOportunidadesRepositoryInstance: SupabaseRadarOportunidadesRepository | null = null;
    private static estudarRepositoryInstance: SupabaseEstudarRepository | null = null;
    private static bookRepositoryInstance: SupabaseBookRepository | null = null;
    private static ebookRepositoryInstance: SupabaseEbookRepository | null = null;
    private static adminRepositoryInstance: SupabaseAdminRepository | null = null;
    private static contentRepositoryInstance: SupabaseContentRepository | null = null;
    private static storageRepositoryInstance: SupabaseStorageRepository | null = null;
    private static userManagementRepositoryInstance: SupabaseUserManagementRepository | null = null;
    private static analyticsRepositoryInstance: SupabaseAnalyticsRepository | null = null;
    private static editorialRepositoryInstance: SupabaseEditorialRepository | null = null;
    private static portalNewsRepositoryInstance: SupabasePortalNewsRepository | null = null;
    private static homeDatesRepositoryInstance: SupabaseHomeDatesRepository | null = null;
    private static announcementBarRepositoryInstance: SupabaseAnnouncementBarRepository | null = null;

    /**
     * Obtém instância do repositório de autenticação
     * Singleton Pattern
     */
    static getAuthRepository(): BetterAuthRepository {
        if (!this.authRepositoryInstance) {
            this.authRepositoryInstance = new BetterAuthRepository();
        }
        return this.authRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de newsletters
     * Singleton Pattern
     */
    static getNewsletterRepository(): SupabaseNewsletterRepository {
        if (!this.newsletterRepositoryInstance) {
            this.newsletterRepositoryInstance = new SupabaseNewsletterRepository(supabaseAnon);
        }
        return this.newsletterRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de mini-livros
     * Singleton Pattern
     */
    static getMiniLivroRepository(): SupabaseMiniLivroRepository {
        if (!this.miniLivroRepositoryInstance) {
            this.miniLivroRepositoryInstance = new SupabaseMiniLivroRepository(supabaseAnon);
        }
        return this.miniLivroRepositoryInstance;
    }

    /**
     * Obtém instância do repositório da biblioteca
     * Singleton Pattern
     */
    static getBibliotecaRepository(): SupabaseBibliotecaRepository {
        if (!this.bibliotecaRepositoryInstance) {
            this.bibliotecaRepositoryInstance = new SupabaseBibliotecaRepository(supabaseAnon);
        }
        return this.bibliotecaRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de especial da semana
     * Singleton Pattern
     */
    static getEspecialSemanaRepository(): SupabaseEspecialSemanaRepository {
        if (!this.especialSemanaRepositoryInstance) {
            this.especialSemanaRepositoryInstance = new SupabaseEspecialSemanaRepository(supabaseAnon);
        }
        return this.especialSemanaRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de radar de oportunidades
     * Singleton Pattern
     */
    static getRadarOportunidadesRepository(): SupabaseRadarOportunidadesRepository {
        if (!this.radarOportunidadesRepositoryInstance) {
            this.radarOportunidadesRepositoryInstance = new SupabaseRadarOportunidadesRepository(supabaseAnon);
        }
        return this.radarOportunidadesRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de estudar
     * Singleton Pattern
     */
    static getEstudarRepository(): SupabaseEstudarRepository {
        if (!this.estudarRepositoryInstance) {
            this.estudarRepositoryInstance = new SupabaseEstudarRepository(supabaseAnon);
        }
        return this.estudarRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de livros principais
     * Singleton Pattern
     */
    static getBookRepository(): SupabaseBookRepository {
        if (!this.bookRepositoryInstance) {
            this.bookRepositoryInstance = new SupabaseBookRepository(supabaseAnon);
        }
        return this.bookRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de e-books
     * Singleton Pattern
     */
    static getEbookRepository(): SupabaseEbookRepository {
        if (!this.ebookRepositoryInstance) {
            this.ebookRepositoryInstance = new SupabaseEbookRepository(supabaseAnon);
        }
        return this.ebookRepositoryInstance;
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
     */
    static getEspecialSemanaUseCase(): GetEspecialSemanaUseCase {
        return new GetEspecialSemanaUseCase(this.getEspecialSemanaRepository());
    }

    static getRadarOportunidadesUseCase(): GetRadarOportunidadesUseCase {
        return new GetRadarOportunidadesUseCase(this.getRadarOportunidadesRepository());
    }

    static getEstudarUseCase(): GetEstudarUseCase {
        return new GetEstudarUseCase(this.getEstudarRepository());
    }

    static getEbookUseCase(): GetEbookUseCase {
        return new GetEbookUseCase(this.getEbookRepository());
    }

    static getContentViewNavigationUseCase(): GetContentViewNavigationUseCase {
        return new GetContentViewNavigationUseCase({
            newsletterRepository: this.getNewsletterRepository(),
            miniLivroRepository: this.getMiniLivroRepository(),
            bibliotecaRepository: this.getBibliotecaRepository(),
            especialSemanaRepository: this.getEspecialSemanaRepository(),
            radarOportunidadesRepository: this.getRadarOportunidadesRepository(),
            estudarRepository: this.getEstudarRepository(),
            ebookRepository: this.getEbookRepository(),
        });
    }

    static getActiveBookUseCase(): GetActiveBookUseCase {
        return new GetActiveBookUseCase(this.getBookRepository());
    }

    static getEditorialRepository(): SupabaseEditorialRepository {
        if (!this.editorialRepositoryInstance) {
            this.editorialRepositoryInstance = new SupabaseEditorialRepository(supabase); // supabase: precisa de sessão para escrita via RLS
        }
        return this.editorialRepositoryInstance;
    }

    static getEditorialUseCase(): GetEditorialUseCase {
        return new GetEditorialUseCase(this.getEditorialRepository());
    }

    static getSaveEditorialUseCase(): SaveEditorialUseCase {
        return new SaveEditorialUseCase(this.getEditorialRepository());
    }

    static getPortalNewsRepository(): SupabasePortalNewsRepository {
        if (!this.portalNewsRepositoryInstance) {
            this.portalNewsRepositoryInstance = new SupabasePortalNewsRepository(supabaseAnon);
        }
        return this.portalNewsRepositoryInstance;
    }

    static getPortalNewsUseCase(): GetPortalNewsUseCase {
        return new GetPortalNewsUseCase(this.getPortalNewsRepository());
    }

    /**
     * Obtém instância do repositório de home dates (materialized view)
     * Singleton Pattern
     */
    static getHomeDatesRepository(): SupabaseHomeDatesRepository {
        if (!this.homeDatesRepositoryInstance) {
            this.homeDatesRepositoryInstance = new SupabaseHomeDatesRepository(supabaseAnon);
        }
        return this.homeDatesRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de barras de aviso
     * Singleton Pattern
     */
    static getAnnouncementBarRepository(): SupabaseAnnouncementBarRepository {
        if (!this.announcementBarRepositoryInstance) {
            this.announcementBarRepositoryInstance = new SupabaseAnnouncementBarRepository(supabaseAnon, supabase);
        }
        return this.announcementBarRepositoryInstance;
    }

    static getAnnouncementBarsUseCase(): GetAnnouncementBarsUseCase {
        return new GetAnnouncementBarsUseCase(this.getAnnouncementBarRepository());
    }

    static getCreateAnnouncementBarUseCase(): CreateAnnouncementBarUseCase {
        return new CreateAnnouncementBarUseCase(this.getAnnouncementBarRepository());
    }

    static getUpdateAnnouncementBarUseCase(): UpdateAnnouncementBarUseCase {
        return new UpdateAnnouncementBarUseCase(this.getAnnouncementBarRepository());
    }

    static getDeleteAnnouncementBarUseCase(): DeleteAnnouncementBarUseCase {
        return new DeleteAnnouncementBarUseCase(this.getAnnouncementBarRepository());
    }

    static getToggleAnnouncementBarUseCase(): ToggleAnnouncementBarUseCase {
        return new ToggleAnnouncementBarUseCase(this.getAnnouncementBarRepository());
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
    static getUsersUseCase(): GetUsersUseCase {
        return new GetUsersUseCase(this.getUserManagementRepository());
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

    static getTodayRegistrationsUseCase(): GetTodayRegistrationsUseCase {
        return new GetTodayRegistrationsUseCase(this.getUserManagementRepository());
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
     * Factory para busca de conteúdo em paralelo entre os 4 repositórios.
     * Novo a cada chamada — stateless, depende de repositórios singleton.
     */
    static getSearchContentUseCase(): SearchContentUseCase {
        return new SearchContentUseCase(
            this.getNewsletterRepository(),
            this.getMiniLivroRepository(),
            this.getBibliotecaRepository(),
            this.getEspecialSemanaRepository(),
            this.getRadarOportunidadesRepository(),
            this.getEstudarRepository(),
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
        this.especialSemanaRepositoryInstance = null;
        this.radarOportunidadesRepositoryInstance = null;
        this.estudarRepositoryInstance = null;
        this.bookRepositoryInstance = null;
        this.ebookRepositoryInstance = null;
        this.adminRepositoryInstance = null;
        this.contentRepositoryInstance = null;
        this.storageRepositoryInstance = null;
        this.userManagementRepositoryInstance = null;
        this.analyticsRepositoryInstance = null;
        this.editorialRepositoryInstance = null;
        this.portalNewsRepositoryInstance = null;
        this.homeDatesRepositoryInstance = null;
        this.announcementBarRepositoryInstance = null;
    }
}

export default DIContainer;
