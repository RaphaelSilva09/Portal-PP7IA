/**
 * IAdminRepository Interface (Domain Layer)
 *
 * Define o contrato para operações de admin.
 * Implementações concretas ficam na camada de infraestrutura.
 *
 * Princípios aplicados:
 * - DIP: Abstração que permite inversão de dependência
 * - ISP: Interface segregada para operações de admin
 */

export interface IAdminRepository {
    /**
     * Verifica se um usuário é admin
     * @param userId - ID do usuário (UUID)
     * @returns true se usuário é admin, false caso contrário
     */
    isAdmin(userId: string): Promise<boolean>;
}
