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
import { GetEspecialSemanaUseCase } from "../../application/usecases/GetEspecialSemanaUseCase";
import { GetEstudarUseCase } from "../../application/usecases/GetEstudarUseCase";
import { GetMiniLivrosUseCase } from "../../application/usecases/GetMiniLivrosUseCase";
import { GetMiniLivroSectionsUseCase } from "../../application/usecases/GetMiniLivroSectionsUseCase";
import { GetNewslettersUseCase } from "../../application/usecases/GetNewslettersUseCase";
import { GetPortalNewsUseCase } from "../../application/usecases/GetPortalNewsUseCase";
import { GetRadarOportunidadesUseCase } from "../../application/usecases/GetRadarOportunidadesUseCase";
import { PromoteUserToAdminUseCase } from "../../application/usecases/PromoteUserToAdminUseCase";
import { ResetPasswordWithTokenUseCase } from "../../application/usecases/ResetPasswordWithTokenUseCase";
import { SearchContentUseCase } from "../../application/usecases/SearchContentUseCase";
import { SendPasswordResetUseCase } from "../../application/usecases/SendPasswordResetUseCase";
import { SignInUseCase } from "../../application/usecases/SignInUseCase";
import { SignOutUseCase } from "../../application/usecases/SignOutUseCase";
import { SignUpUseCase } from "../../application/usecases/SignUpUseCase";
import { UpdateContentWithFilesUseCase } from "../../application/usecases/UpdateContentWithFilesUseCase";
import { VerifyPasswordResetOTPUseCase } from "../../application/usecases/VerifyPasswordResetOTPUseCase";
import { PostgresAnnouncementBarRepository } from "../repositories/PostgresAnnouncementBarRepository";
import { PostgresAdminRepository } from "../repositories/PostgresAdminRepository";
import { PostgresAnalyticsRepository } from "../repositories/PostgresAnalyticsRepository";
import { BetterAuthRepository } from "../repositories/BetterAuthRepository";
import { PostgresBibliotecaRepository } from "../repositories/PostgresBibliotecaRepository";
import { PostgresBookRepository } from "../repositories/PostgresBookRepository";
import { PostgresContentRepository } from "../repositories/PostgresContentRepository";
import { PostgresEbookRepository } from "../repositories/PostgresEbookRepository";
import { PostgresEspecialSemanaRepository } from "../repositories/PostgresEspecialSemanaRepository";
import { PostgresEstudarRepository } from "../repositories/PostgresEstudarRepository";
import { PostgresHomeDatesRepository } from "../repositories/PostgresHomeDatesRepository";
import { PostgresMiniLivroRepository } from "../repositories/PostgresMiniLivroRepository";
import { PostgresMiniLivroSectionRepository } from "../repositories/PostgresMiniLivroSectionRepository";
import { PostgresNewsletterRepository } from "../repositories/PostgresNewsletterRepository";
import { PostgresPortalNewsRepository } from "../repositories/PostgresPortalNewsRepository";
import { PostgresRadarOportunidadesRepository } from "../repositories/PostgresRadarOportunidadesRepository";
import { FilesystemStorageRepository } from "../repositories/FilesystemStorageRepository";
import { PostgresUserManagementRepository } from "../repositories/PostgresUserManagementRepository";
import { PostgresHomepageConfigRepository } from "../repositories/PostgresHomepageConfigRepository";
import { GetHomepageConfigUseCase } from "../../application/usecases/GetHomepageConfigUseCase";
import { UpdateHomepageConfigUseCase } from "../../application/usecases/UpdateHomepageConfigUseCase";
import { BlockColorsRepository } from "../repositories/BlockColorsRepository";
import { GetBlockColorsUseCase } from "../../application/usecases/GetBlockColorsUseCase";
import { UpdateBlockColorsUseCase } from "../../application/usecases/UpdateBlockColorsUseCase";
import { ExplorarConfigRepository } from "../repositories/ExplorarConfigRepository";
import { GetExplorarConfigUseCase } from "../../application/usecases/GetExplorarConfigUseCase";
import { UpdateExplorarConfigUseCase } from "../../application/usecases/UpdateExplorarConfigUseCase";
import { SiteBgRepository } from "../repositories/SiteBgRepository";
import { GetSiteBgUseCase } from "../../application/usecases/GetSiteBgUseCase";
import { UpdateSiteBgUseCase } from "../../application/usecases/UpdateSiteBgUseCase";
import { SupabasePromptLibraryRepository } from "../repositories/SupabasePromptLibraryRepository";
import { SupabaseFaqRepository } from "../repositories/SupabaseFaqRepository";
import { SupabaseReaderQuestionRepository } from "../repositories/SupabaseReaderQuestionRepository";
import { SupabaseContentReactionRepository } from "../repositories/SupabaseContentReactionRepository";
import { SupabaseReferralRepository } from "../repositories/SupabaseReferralRepository";

/**
 * Container de Dependências
 * Lazy Initialization: Cria instâncias apenas quando necessário
 */
class DIContainer {
    private static authRepositoryInstance: BetterAuthRepository | null = null;
    private static newsletterRepositoryInstance: PostgresNewsletterRepository | null = null;
    private static miniLivroRepositoryInstance: PostgresMiniLivroRepository | null = null;
    private static miniLivroSectionRepositoryInstance: PostgresMiniLivroSectionRepository | null = null;
    private static bibliotecaRepositoryInstance: PostgresBibliotecaRepository | null = null;
    private static especialSemanaRepositoryInstance: PostgresEspecialSemanaRepository | null = null;
    private static radarOportunidadesRepositoryInstance: PostgresRadarOportunidadesRepository | null = null;
    private static estudarRepositoryInstance: PostgresEstudarRepository | null = null;
    private static bookRepositoryInstance: PostgresBookRepository | null = null;
    private static ebookRepositoryInstance: PostgresEbookRepository | null = null;
    private static adminRepositoryInstance: PostgresAdminRepository | null = null;
    private static contentRepositoryInstance: PostgresContentRepository | null = null;
    private static storageRepositoryInstance: FilesystemStorageRepository | null = null;
    private static userManagementRepositoryInstance: PostgresUserManagementRepository | null = null;
    private static analyticsRepositoryInstance: PostgresAnalyticsRepository | null = null;
    private static portalNewsRepositoryInstance: PostgresPortalNewsRepository | null = null;
    private static homeDatesRepositoryInstance: PostgresHomeDatesRepository | null = null;
    private static announcementBarRepositoryInstance: PostgresAnnouncementBarRepository | null = null;
    private static homepageConfigRepositoryInstance: PostgresHomepageConfigRepository | null = null;
    private static blockColorsRepositoryInstance: BlockColorsRepository | null = null;
    private static explorarConfigRepositoryInstance: ExplorarConfigRepository | null = null;
    private static siteBgRepositoryInstance: SiteBgRepository | null = null;
    private static promptLibraryRepositoryInstance: SupabasePromptLibraryRepository | null = null;
    private static faqRepositoryInstance: SupabaseFaqRepository | null = null;
    private static readerQuestionRepositoryInstance: SupabaseReaderQuestionRepository | null = null;
    private static contentReactionRepositoryInstance: SupabaseContentReactionRepository | null = null;
    private static referralRepositoryInstance: SupabaseReferralRepository | null = null;

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
    static getNewsletterRepository(): PostgresNewsletterRepository {
        if (!this.newsletterRepositoryInstance) {
            this.newsletterRepositoryInstance = new PostgresNewsletterRepository();
        }
        return this.newsletterRepositoryInstance;
    }

    static getPromptLibraryRepository(): SupabasePromptLibraryRepository {
        if (!this.promptLibraryRepositoryInstance) {
            this.promptLibraryRepositoryInstance = new SupabasePromptLibraryRepository();
        }
        return this.promptLibraryRepositoryInstance;
    }

    static getFaqRepository(): SupabaseFaqRepository {
        if (!this.faqRepositoryInstance) {
            this.faqRepositoryInstance = new SupabaseFaqRepository();
        }
        return this.faqRepositoryInstance;
    }

    static getReaderQuestionRepository(): SupabaseReaderQuestionRepository {
        if (!this.readerQuestionRepositoryInstance) {
            this.readerQuestionRepositoryInstance = new SupabaseReaderQuestionRepository();
        }
        return this.readerQuestionRepositoryInstance;
    }

    static getContentReactionRepository(): SupabaseContentReactionRepository {
        if (!this.contentReactionRepositoryInstance) {
            this.contentReactionRepositoryInstance = new SupabaseContentReactionRepository();
        }
        return this.contentReactionRepositoryInstance;
    }

    static getReferralRepository(): SupabaseReferralRepository {
        if (!this.referralRepositoryInstance) {
            this.referralRepositoryInstance = new SupabaseReferralRepository();
        }
        return this.referralRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de mini-livros
     * Singleton Pattern
     */
    static getMiniLivroRepository(): PostgresMiniLivroRepository {
        if (!this.miniLivroRepositoryInstance) {
            this.miniLivroRepositoryInstance = new PostgresMiniLivroRepository();
        }
        return this.miniLivroRepositoryInstance;
    }

    static getMiniLivroSectionRepository(): PostgresMiniLivroSectionRepository {
        if (!this.miniLivroSectionRepositoryInstance) {
            this.miniLivroSectionRepositoryInstance = new PostgresMiniLivroSectionRepository();
        }
        return this.miniLivroSectionRepositoryInstance;
    }

    /**
     * Obtém instância do repositório da biblioteca
     * Singleton Pattern
     */
    static getBibliotecaRepository(): PostgresBibliotecaRepository {
        if (!this.bibliotecaRepositoryInstance) {
            this.bibliotecaRepositoryInstance = new PostgresBibliotecaRepository();
        }
        return this.bibliotecaRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de especial da semana
     * Singleton Pattern
     */
    static getEspecialSemanaRepository(): PostgresEspecialSemanaRepository {
        if (!this.especialSemanaRepositoryInstance) {
            this.especialSemanaRepositoryInstance = new PostgresEspecialSemanaRepository();
        }
        return this.especialSemanaRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de radar de oportunidades
     * Singleton Pattern
     */
    static getRadarOportunidadesRepository(): PostgresRadarOportunidadesRepository {
        if (!this.radarOportunidadesRepositoryInstance) {
            this.radarOportunidadesRepositoryInstance = new PostgresRadarOportunidadesRepository();
        }
        return this.radarOportunidadesRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de estudar
     * Singleton Pattern
     */
    static getEstudarRepository(): PostgresEstudarRepository {
        if (!this.estudarRepositoryInstance) {
            this.estudarRepositoryInstance = new PostgresEstudarRepository();
        }
        return this.estudarRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de livros principais
     * Singleton Pattern
     */
    static getBookRepository(): PostgresBookRepository {
        if (!this.bookRepositoryInstance) {
            this.bookRepositoryInstance = new PostgresBookRepository();
        }
        return this.bookRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de e-books
     * Singleton Pattern
     */
    static getEbookRepository(): PostgresEbookRepository {
        if (!this.ebookRepositoryInstance) {
            this.ebookRepositoryInstance = new PostgresEbookRepository();
        }
        return this.ebookRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de gerenciamento de usuários
     * Singleton Pattern
     */
    static getUserManagementRepository(): PostgresUserManagementRepository {
        if (!this.userManagementRepositoryInstance) {
            this.userManagementRepositoryInstance = new PostgresUserManagementRepository();
        }
        return this.userManagementRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de analytics
     * Singleton Pattern
     */
    static getAnalyticsRepository(): PostgresAnalyticsRepository {
        if (!this.analyticsRepositoryInstance) {
            this.analyticsRepositoryInstance = new PostgresAnalyticsRepository();
        }
        return this.analyticsRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de admin
     * Singleton Pattern
     */
    static getAdminRepository(): PostgresAdminRepository {
        if (!this.adminRepositoryInstance) {
            this.adminRepositoryInstance = new PostgresAdminRepository();
        }
        return this.adminRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de conteúdo genérico
     * Singleton Pattern
     */
    static getContentRepository(): PostgresContentRepository {
        if (!this.contentRepositoryInstance) {
            this.contentRepositoryInstance = new PostgresContentRepository();
        }
        return this.contentRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de storage
     * Singleton Pattern
     */
    static getStorageRepository(): FilesystemStorageRepository {
        if (!this.storageRepositoryInstance) {
            this.storageRepositoryInstance = new FilesystemStorageRepository();
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
            bookRepository: this.getBookRepository(),
            newsletterRepository: this.getNewsletterRepository(),
            miniLivroRepository: this.getMiniLivroRepository(),
            miniLivroSectionRepository: this.getMiniLivroSectionRepository(),
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


    static getPortalNewsRepository(): PostgresPortalNewsRepository {
        if (!this.portalNewsRepositoryInstance) {
            this.portalNewsRepositoryInstance = new PostgresPortalNewsRepository();
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
    static getHomeDatesRepository(): PostgresHomeDatesRepository {
        if (!this.homeDatesRepositoryInstance) {
            this.homeDatesRepositoryInstance = new PostgresHomeDatesRepository();
        }
        return this.homeDatesRepositoryInstance;
    }

    /**
     * Obtém instância do repositório de barras de aviso
     * Singleton Pattern
     */
    static getAnnouncementBarRepository(): PostgresAnnouncementBarRepository {
        if (!this.announcementBarRepositoryInstance) {
            this.announcementBarRepositoryInstance = new PostgresAnnouncementBarRepository();
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

    static getHomepageConfigRepository(): PostgresHomepageConfigRepository {
        if (!this.homepageConfigRepositoryInstance) {
            this.homepageConfigRepositoryInstance = new PostgresHomepageConfigRepository();
        }
        return this.homepageConfigRepositoryInstance;
    }

    static getHomepageConfigUseCase(): GetHomepageConfigUseCase {
        return new GetHomepageConfigUseCase(this.getHomepageConfigRepository());
    }

    static getUpdateHomepageConfigUseCase(): UpdateHomepageConfigUseCase {
        return new UpdateHomepageConfigUseCase(this.getHomepageConfigRepository());
    }

    static getBlockColorsRepository(): BlockColorsRepository {
        if (!this.blockColorsRepositoryInstance) {
            this.blockColorsRepositoryInstance = new BlockColorsRepository();
        }
        return this.blockColorsRepositoryInstance;
    }

    static getBlockColorsUseCase(): GetBlockColorsUseCase {
        return new GetBlockColorsUseCase(this.getBlockColorsRepository());
    }

    static getUpdateBlockColorsUseCase(): UpdateBlockColorsUseCase {
        return new UpdateBlockColorsUseCase(this.getBlockColorsRepository());
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

    static getMiniLivroSectionsUseCase(): GetMiniLivroSectionsUseCase {
        return new GetMiniLivroSectionsUseCase(this.getMiniLivroSectionRepository());
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

    static getExplorarConfigRepository(): ExplorarConfigRepository {
        if (!this.explorarConfigRepositoryInstance) {
            this.explorarConfigRepositoryInstance = new ExplorarConfigRepository();
        }
        return this.explorarConfigRepositoryInstance;
    }

    static getExplorarConfigUseCase(): GetExplorarConfigUseCase {
        return new GetExplorarConfigUseCase(this.getExplorarConfigRepository());
    }

    static getUpdateExplorarConfigUseCase(): UpdateExplorarConfigUseCase {
        return new UpdateExplorarConfigUseCase(this.getExplorarConfigRepository());
    }

    static getSiteBgRepository(): SiteBgRepository {
        if (!this.siteBgRepositoryInstance) {
            this.siteBgRepositoryInstance = new SiteBgRepository();
        }
        return this.siteBgRepositoryInstance;
    }

    static getSiteBgUseCase(): GetSiteBgUseCase {
        return new GetSiteBgUseCase(this.getSiteBgRepository());
    }

    static getUpdateSiteBgUseCase(): UpdateSiteBgUseCase {
        return new UpdateSiteBgUseCase(this.getSiteBgRepository());
    }

    /**
     * Reseta container (útil para testes)
     */
    static reset(): void {
        this.authRepositoryInstance = null;
        this.newsletterRepositoryInstance = null;
        this.miniLivroRepositoryInstance = null;
        this.miniLivroSectionRepositoryInstance = null;
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
        this.portalNewsRepositoryInstance = null;
        this.homeDatesRepositoryInstance = null;
        this.announcementBarRepositoryInstance = null;
    }
}

export default DIContainer;
