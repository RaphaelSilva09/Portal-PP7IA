/**
 * IUserManagementRepository Interface (Domain Layer)
 *
 * Define o contrato para gerenciamento de usuários no contexto admin.
 * Permite listar usuários paginados, promover/demover admins, e deletar usuários.
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
    lastSignInAt: Date | null;
    /** Última vez que o usuário abriu o portal já autenticado (distinto de login) — ver /api/user/activity. */
    lastSeenAt: Date | null;
    acceptEmailUpdates: boolean;
    acceptWhatsappUpdates: boolean;
    emailVerified: boolean;
}

/** Janelas de atividade recente suportadas pelo filtro do painel admin. */
export type ActiveWithinDays = 7 | 15 | 30;

export interface UpdateUserParams {
    nome: string;
    email: string;
    celular: string;
}

export interface GetUsersParams {
    page: number;
    pageSize: 10 | 25 | 50;
    search?: string;
    /** Filtra a usuários com `lastSeenAt` dentro dos últimos N dias. */
    activeWithinDays?: ActiveWithinDays;
}

export interface PaginatedUsersResult {
    users: UserListItem[];
    total: number;
    page: number;
    pageSize: number;
}

export interface IUserManagementRepository {
    /**
     * Lista usuários com paginação server-side
     * Requer: usuário admin autenticado
     * @param params - Parâmetros de paginação e busca
     * @returns Página de usuários e total de registros
     */
    getUsers(params: GetUsersParams): Promise<PaginatedUsersResult>;

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
     * Atualiza dados de um usuário (nome, email, celular)
     * Requer: service_role key (via API route)
     * @param userId - ID do usuário
     * @param params - Dados a atualizar
     */
    updateUser(userId: string, params: UpdateUserParams): Promise<void>;

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

    /**
     * Lista usuários cadastrados em uma data específica (dia completo, UTC)
     * @param date - Data a filtrar
     * @returns Lista de usuários cadastrados naquele dia, ordenados do mais recente ao mais antigo
     */
    getUsersByDate(date: Date): Promise<UserListItem[]>;
}
