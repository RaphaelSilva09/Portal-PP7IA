/**
 * SupabaseAnalyticsRepository (Infrastructure Layer)
 *
 * Implementação concreta do IAnalyticsRepository usando Supabase.
 * Obtém estatísticas agregadas para dashboard admin.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta APIs Supabase para nosso domínio
 * - SRP: Responsável apenas por estatísticas e métricas
 * - Graceful Degradation: Retorna valores padrão em caso de erro
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
    ContentStats,
    DashboardStats,
    IAnalyticsRepository,
    StorageStats,
    UserStats,
} from "../../domain/repositories/IAnalyticsRepository";

export class SupabaseAnalyticsRepository implements IAnalyticsRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async getContentStats(): Promise<ContentStats> {
        try {
            // Buscar contadores de todas as tabelas em paralelo
            const [newsletters, miniLivros, biblioteca, especialSemana, ebooks, radarOportunidades, estudar] =
                await Promise.all([
                    this.countTable("newsletters"),
                    this.countTable("mini_livros"), // corrigido: era "mini-livros"
                    this.countTable("biblioteca"),
                    this.countTable("especial_semana"), // corrigido: era "especial-semana"
                    this.countTable("ebooks"), // novo
                    this.countTable("radar_oportunidades"), // novo
                    this.countTable("estudar"), // novo
                ]);

            const total =
                newsletters + miniLivros + biblioteca + especialSemana + ebooks + radarOportunidades + estudar;

            return { newsletters, miniLivros, biblioteca, especialSemana, ebooks, radarOportunidades, estudar, total };
        } catch (err) {
            console.error("Erro ao obter estatísticas de conteúdo:", err);
            return {
                newsletters: 0,
                miniLivros: 0,
                biblioteca: 0,
                especialSemana: 0,
                ebooks: 0,
                radarOportunidades: 0,
                estudar: 0,
                total: 0,
            };
        }
    }

    async getUserStats(): Promise<UserStats> {
        try {
            // Total de usuários
            const { count: totalUsers, error: totalError } = await this.supabase
                .from("users")
                .select("*", { count: "exact", head: true });

            if (totalError) {
                console.error("Erro ao contar usuários:", totalError.message);
            }

            // Usuários dos últimos 30 dias
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 30);

            const { count: newUsers, error: newError } = await this.supabase
                .from("users")
                .select("*", { count: "exact", head: true })
                .gte("created_at", cutoffDate.toISOString());

            if (newError) {
                console.error("Erro ao contar novos usuários:", newError.message);
            }

            // Contar admins via função SQL segura (valida is_admin internamente)
            const { data: adminCount, error: adminError } = await this.supabase.rpc("count_admins");

            if (adminError) {
                console.error("Erro ao contar admins:", adminError.message);
            }

            return {
                totalUsers: totalUsers ?? 0,
                newUsersLast30Days: newUsers ?? 0,
                totalAdmins: adminCount ?? 0,
            };
        } catch (err) {
            console.error("Erro ao obter estatísticas de usuários:", err);
            return {
                totalUsers: 0,
                newUsersLast30Days: 0,
                totalAdmins: 0,
            };
        }
    }

    async getStorageStats(): Promise<StorageStats | null> {
        // Storage stats não disponível via API pública do Supabase
        // Retornar null por enquanto
        // Em produção, poderia ser implementado via função no banco
        // ou via API do Supabase Management API (requer service_role)
        return null;
    }

    async getDashboardStats(): Promise<DashboardStats> {
        try {
            const [content, users, storage] = await Promise.all([
                this.getContentStats(),
                this.getUserStats(),
                this.getStorageStats(),
            ]);

            return {
                content,
                users,
                storage: storage ?? undefined,
            };
        } catch (err) {
            console.error("Erro ao obter estatísticas do dashboard:", err);
            return {
                content: {
                    newsletters: 0,
                    miniLivros: 0,
                    biblioteca: 0,
                    especialSemana: 0,
                    ebooks: 0,
                    radarOportunidades: 0,
                    estudar: 0,
                    total: 0,
                },
                users: {
                    totalUsers: 0,
                    newUsersLast30Days: 0,
                    totalAdmins: 0,
                },
            };
        }
    }

    async getRecentContent(limit: number = 5): Promise<
        Array<{
            type: string;
            id: number;
            title: string;
            createdAt: Date;
        }>
    > {
        try {
            // Buscar os mais recentes de todos os tipos
            const [newsletters, miniLivros, biblioteca, especialSemana, ebooks, radar, estudar] = await Promise.all([
                this.getRecentFromTable("newsletters", "newsletter", limit),
                this.getRecentFromTable("mini_livros", "mini-livro", limit), // corrigido
                this.getRecentFromTable("biblioteca", "biblioteca", limit),
                this.getRecentFromTable("especial_semana", "especial-semana", limit), // corrigido
                this.getRecentFromTable("ebooks", "ebook", limit), // novo
                this.getRecentFromTable("radar_oportunidades", "radar_oportunidades", limit), // novo
                this.getRecentFromTable("estudar", "estudar", limit), // novo
            ]);

            // Combinar todos e ordenar por data
            const allContent = [
                ...newsletters,
                ...miniLivros,
                ...biblioteca,
                ...especialSemana,
                ...ebooks,
                ...radar,
                ...estudar,
            ];
            allContent.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            // Retornar apenas os N mais recentes
            return allContent.slice(0, limit);
        } catch (err) {
            console.error("Erro ao buscar conteúdos recentes:", err);
            return [];
        }
    }

    /**
     * Helper: Conta registros de uma tabela
     */
    private async countTable(tableName: string): Promise<number> {
        try {
            const { count, error } = await this.supabase.from(tableName).select("*", { count: "exact", head: true });

            if (error) {
                console.error(`Erro ao contar ${tableName}:`, error.message);
                return 0;
            }

            return count ?? 0;
        } catch (err) {
            console.error(`Erro inesperado ao contar ${tableName}:`, err);
            return 0;
        }
    }

    /**
     * Helper: Busca conteúdos recentes de uma tabela
     */
    private async getRecentFromTable(
        tableName: string,
        type: string,
        limit: number,
    ): Promise<Array<{ type: string; id: number; title: string; createdAt: Date }>> {
        try {
            const { data, error } = await this.supabase
                .from(tableName)
                .select("id, title, created_at")
                .order("id", { ascending: false })
                .limit(limit);

            if (error || !data) {
                return [];
            }

            return data.map(row => ({
                type,
                id: row.id,
                title: row.title,
                createdAt: new Date(row.created_at),
            }));
        } catch (err) {
            console.error(`Erro ao buscar recentes de ${tableName}:`, err);
            return [];
        }
    }
}
