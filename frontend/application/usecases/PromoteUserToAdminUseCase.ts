/**
 * PromoteUserToAdminUseCase (Application Layer)
 *
 * Promove um usuário comum a administrador.
 * Adiciona role "admin" no JWT app_metadata.
 * Requer: service_role key (executado via API route).
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por promover usuário
 * - DIP: Depende de abstração (IUserManagementRepository)
 */

import type { IUserManagementRepository } from "@/domain/repositories/IUserManagementRepository";

export class PromoteUserToAdminUseCase {
    constructor(private readonly userManagementRepository: IUserManagementRepository) {}

    async execute(userId: string): Promise<boolean> {
        if (!userId) {
            throw new Error("ID do usuário é obrigatório");
        }

        const success = await this.userManagementRepository.promoteToAdmin(userId);

        if (!success) {
            throw new Error("Falha ao promover usuário a admin");
        }

        return success;
    }
}
