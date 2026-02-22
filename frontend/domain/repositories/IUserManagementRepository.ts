/**
 * IUserManagementRepository Interface (Domain Layer)
 *
 * Define o contrato para gerenciamento de usuários no contexto admin.
 * Permite listar usuários, promover/demover admins, e deletar usuários.
 *
 * Princípios aplicados:
 * - DIP: Abstração que permite inversão de dependência
 * - ISP: Interface segregada para operações admin de usuários
 * - Least Privilege: Apenas admin pode executar essas operações
 */

export interface UserListItem {
    id: string;
    email: string;
    nome: string;
    celular: string;
    isAdmin: boolean;
    createdAt: Date;
    acceptEmailUpdates: boolean;
    acceptWhatsappUpdates: boolean;
}

export interface IUserManagementRepository {
    /**
     * Lista todos os usuários cadastrados
     * Requer: usuário admin autenticado
     * @returns Lista de usuários ordenada por data de criação (mais recente primeiro)
     */
    getAllUsers(): Promise<UserListItem[]>;

    /**
     * Busca um usuário específico por ID
     * @param userId - ID do usuário
     * @returns UserListItem ou null se não encontrado
     */
    getUserById(userId: string): Promise<UserListItem | null>;

    /**
     * Promove um usuário a admin (adiciona role "admin" no JWT)
     * Requer: service_role key (via API route)
     * @param userId - ID do usuário a promover
     * @returns true se sucesso, false se falha
     */
    promoteToAdmin(userId: string): Promise<boolean>;

    /**
     * Remove privilégios admin de um usuário
     * Requer: service_role key (via API route)
     * @param userId - ID do usuário a demover
     * @returns true se sucesso, false se falha
     */
    demoteFromAdmin(userId: string): Promise<boolean>;

    /**
     * Deleta um usuário e seus dados relacionados
     * Requer: service_role key (via API route)
     * @param userId - ID do usuário a deletar
     * @returns true se deletado, false se falha
     */
    deleteUser(userId: string): Promise<boolean>;

    /**
     * Conta total de usuários cadastrados
     * @returns Quantidade total de usuários
     */
    countUsers(): Promise<number>;

    /**
     * Conta usuários cadastrados em um período
     * @param days - Número de dias a considerar (ex: 30 para último mês)
     * @returns Quantidade de novos usuários no período
     */
    countNewUsers(days: number): Promise<number>;
}
