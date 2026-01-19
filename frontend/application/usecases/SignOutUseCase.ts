/**
 * SignOutUseCase (Application Layer)
 *
 * Caso de uso para logout de usuários.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pelo fluxo de logout
 * - DIP: Depende de abstração (IAuthRepository)
 */

import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class SignOutUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    /**
     * Executa o caso de uso de logout
     */
    async execute(): Promise<void> {
        await this.authRepository.signOut();
    }
}
