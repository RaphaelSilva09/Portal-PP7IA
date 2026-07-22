/**
 * IAnalyticsRepository Interface (Domain Layer)
 *
 * Define o contrato para obtenção de estatísticas e métricas do sistema.
 * Usado no dashboard admin para exibir totais, tendências e KPIs.
 *
 * Princípios aplicados:
 * - DIP: Abstração que permite inversão de dependência
 * - ISP: Interface segregada para operações de analytics
 * - SRP: Responsável apenas por estatísticas e métricas
 */

export interface ContentStats {
    newsletters: number;
    miniLivros: number;
    biblioteca: number;
    especialSemana: number;
    ebooks: number;
    radarOportunidades: number;
    estudar: number;
    total: number;
}

export interface UserStats {
    totalUsers: number;
    newUsersLast30Days: number;
    totalAdmins: number;
}

/** Contagem de leitores que abriram o portal (não login) dentro de cada janela. */
export interface ActivityStats {
    activeToday: number;
    activeLast7Days: number;
    activeLast15Days: number;
    activeLast30Days: number;
}

export interface StorageStats {
    totalSizeMB: number;
    newslettersSizeMB: number;
    miniLivrosSizeMB: number;
    bibliotecaSizeMB: number;
    especialSemanaSizeMB: number;
}

export interface DashboardStats {
    content: ContentStats;
    users: UserStats;
    activity: ActivityStats;
    storage?: StorageStats; // Optional - pode não estar disponível
}

export interface IAnalyticsRepository {
    /**
     * Obtém estatísticas de conteúdo
     * Conta total de itens por tipo
     * @returns ContentStats com totais por categoria
     */
    getContentStats(): Promise<ContentStats>;

    /**
     * Obtém estatísticas de usuários
     * Conta total e novos usuários
     * @returns UserStats com métricas de usuários
     */
    getUserStats(): Promise<UserStats>;

    /**
     * Obtém quantos leitores abriram o portal (last_seen_at) em cada janela
     * de tempo — distinto de login. Base para "quem está realmente usando o
     * portal", não só cadastrado.
     * @returns ActivityStats com contagens por janela
     */
    getActivityStats(): Promise<ActivityStats>;

    /**
     * Obtém estatísticas de storage (opcional)
     * Calcula uso de storage por bucket
     * @returns StorageStats ou null se não disponível
     */
    getStorageStats(): Promise<StorageStats | null>;

    /**
     * Obtém todas as estatísticas do dashboard
     * Agrega content + users + storage
     * @returns DashboardStats completo
     */
    getDashboardStats(): Promise<DashboardStats>;

    /**
     * Obtém conteúdos mais recentes (últimos N)
     * Para exibir na seção "Recentes" do dashboard
     * @param limit - Quantidade máxima a retornar (padrão: 5)
     * @returns Array de objetos com tipo, título, id, data
     */
    getRecentContent(limit?: number): Promise<
        Array<{
            type: string;
            id: number;
            title: string;
            createdAt: Date;
        }>
    >;
}
