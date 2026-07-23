/**
 * IAxiomaUsageRepository Interface (Domain Layer)
 *
 * Define o contrato para controle de uso diário (rate limit) do Axioma, por IP.
 *
 * Princípios aplicados:
 * - DIP: Abstração para inversão de dependência
 * - ISP: Interface segregada para operações de contagem de uso
 */

export interface IAxiomaUsageRepository {
    /** Retorna a contagem de uso do IP no dia corrente (0 se não houver registro). */
    getUsageCount(ip: string): Promise<number>;

    /** Incrementa atomicamente a contagem de uso do IP no dia corrente. */
    incrementUsage(ip: string): Promise<void>;
}
