/**
 * DemoteUserFromAdminUseCase (Application Layer)
 *
 * Remove privilégios de administrador de um usuário.
 * Remove role "admin" do JWT app_metadata.
 * Requer: service_role key (executado via API route).
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por demover usuário
 * - DIP: Depende de abstração (IUserManagementRepository)
 */

import type { IUserManagementRepository } from "@/domain/repositories/IUserManagementRepository";

export class DemoteUserFromAdminUseCase {
    constructor(private readonly userManagementRepository: IUserManagementRepository) {}

    async execute(userId: string): Promise<boolean> {
        if (!userId) {
            throw new Error("ID do usuário é obrigatório");
        }

        const success = await this.userManagementRepository.demoteFromAdmin(userId);

        if (!success) {
            throw new Error("Falha ao remover privilégios de admin");
        }

        return success;
    }
}
