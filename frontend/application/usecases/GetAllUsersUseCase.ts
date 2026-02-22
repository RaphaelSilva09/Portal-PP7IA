/**
 * GetAllUsersUseCase (Application Layer)
 *
 * Lista todos os usuários cadastrados no sistema.
 * Requer: usuário admin autenticado.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por listar usuários
 * - DIP: Depende de abstração (IUserManagementRepository)
 */

import type { IUserManagementRepository, UserListItem } from "@/domain/repositories/IUserManagementRepository";

export class GetAllUsersUseCase {
    constructor(private readonly userManagementRepository: IUserManagementRepository) {}

    async execute(): Promise<UserListItem[]> {
        return await this.userManagementRepository.getAllUsers();
    }
}
