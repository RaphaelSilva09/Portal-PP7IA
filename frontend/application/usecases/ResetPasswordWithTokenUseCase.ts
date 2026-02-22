/**
 * ResetPasswordWithTokenUseCase (Application Layer)
 *
 * Caso de uso para redefinir senha usando token de recuperação.
 *
 * Princípios aplicados:
 * - SRP: Responsabilidade única de redefinir senha com token
 * - DIP: Depende da abstração IAuthRepository
 * - Clean Architecture: Use case orquestra operações de domínio
 * - YAGNI: Implementa apenas o necessário para o caso de uso
 */

import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { isValidPassword } from "../../lib/validators";

export interface ResetPasswordWithTokenInput {
    newPassword: string;
    confirmPassword: string;
}

/**
 * Use Case: Redefinir senha usando token
 */
export class ResetPasswordWithTokenUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    /**
     * Executa o caso de uso de redefinir senha
     * @param input Nova senha e confirmação
     * @throws Error se a validação falhar
     */
    async execute(input: ResetPasswordWithTokenInput): Promise<void> {
        this.validateInput(input);

        await this.authRepository.resetPasswordWithToken(input.newPassword);
    }

    /**
     * Valida os dados de entrada
     * @throws Error se validação falhar
     */
    private validateInput(input: ResetPasswordWithTokenInput): void {
        if (!input.newPassword) {
            throw new Error("Nova senha é obrigatória");
        }

        if (!input.confirmPassword) {
            throw new Error("Confirmação de senha é obrigatória");
        }

        if (input.newPassword !== input.confirmPassword) {
            throw new Error("As senhas não coincidem");
        }

        if (!isValidPassword(input.newPassword, 6)) {
            throw new Error("A senha deve ter no mínimo 6 caracteres");
        }
    }
}
