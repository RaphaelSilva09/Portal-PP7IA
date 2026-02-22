/**
 * GetDashboardStatsUseCase (Application Layer)
 *
 * Obtém estatísticas agregadas para o dashboard admin.
 * Combina métricas de conteúdo, usuários e storage.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por agregar estatísticas
 * - DIP: Depende de abstração (IAnalyticsRepository)
 * - Facade Pattern: Simplifica obtenção de múltiplas métricas
 */

import type { DashboardStats, IAnalyticsRepository } from "@/domain/repositories/IAnalyticsRepository";

export class GetDashboardStatsUseCase {
    constructor(private readonly analyticsRepository: IAnalyticsRepository) {}

    async execute(): Promise<DashboardStats> {
        return await this.analyticsRepository.getDashboardStats();
    }
}
