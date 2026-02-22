/**
 * SendPasswordResetUseCase (Application Layer)
 *
 * Caso de uso para solicitar recuperação de senha.
 *
 * Princípios aplicados:
 * - SRP: Responsabilidade única de solicitar reset de senha
 * - DIP: Depende da abstração IAuthRepository
 * - Clean Architecture: Use case orquestra operações de domínio
 * - YAGNI: Implementa apenas o necessário para o caso de uso
 */

import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { isValidEmail } from "../../lib/validators";

export interface SendPasswordResetInput {
    email: string;
}

/**
 * Use Case: Solicitar recuperação de senha
 */
export class SendPasswordResetUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    /**
     * Executa o caso de uso de solicitar reset de senha
     * @param input Email do usuário
     * @throws Error se o email for inválido
     */
    async execute(input: SendPasswordResetInput): Promise<void> {
        this.validateInput(input);

        const normalizedEmail = input.email.trim().toLowerCase();

        await this.authRepository.sendPasswordReset(normalizedEmail);
    }

    /**
     * Valida os dados de entrada
     * @throws Error se validação falhar
     */
    private validateInput(input: SendPasswordResetInput): void {
        if (!input.email) {
            throw new Error("Email é obrigatório");
        }

        if (!isValidEmail(input.email)) {
            throw new Error("Email inválido");
        }
    }
}
