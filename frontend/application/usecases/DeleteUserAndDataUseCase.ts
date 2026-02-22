/**
 * DeleteUserAndDataUseCase (Application Layer)
 *
 * Deleta um usuário e todos os dados relacionados.
 * Operação irreversível.
 * Requer: service_role key (executado via API route).
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por deletar usuário
 * - DIP: Depende de abstração (IUserManagementRepository)
 * - Fail Secure: Validação antes da operação irreversível
 */

import type { IUserManagementRepository } from "@/domain/repositories/IUserManagementRepository";

export class DeleteUserAndDataUseCase {
    constructor(private readonly userManagementRepository: IUserManagementRepository) {}

    async execute(userId: string): Promise<boolean> {
        if (!userId) {
            throw new Error("ID do usuário é obrigatório");
        }

        // Verificar se usuário existe antes de deletar
        const user = await this.userManagementRepository.getUserById(userId);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const success = await this.userManagementRepository.deleteUser(userId);

        if (!success) {
            throw new Error("Falha ao deletar usuário");
        }

        return success;
    }
}
