/**
 * GetUsersUseCase (Application Layer)
 *
 * Lista usuários com paginação server-side.
 * Requer: usuário admin autenticado.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por listar usuários paginados
 * - DIP: Depende de abstração (IUserManagementRepository)
 */

import type {
    GetUsersParams,
    IUserManagementRepository,
    PaginatedUsersResult,
} from "@/domain/repositories/IUserManagementRepository";

export class GetUsersUseCase {
    constructor(private readonly userManagementRepository: IUserManagementRepository) {}

    async execute(params: GetUsersParams): Promise<PaginatedUsersResult> {
        return await this.userManagementRepository.getUsers(params);
    }
}
