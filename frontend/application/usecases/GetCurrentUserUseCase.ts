/**
 * GetCurrentUserUseCase (Application Layer)
 *
 * Caso de uso para obter usuário autenticado atual.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por recuperar usuário atual
 * - Query Pattern: Operação de leitura sem efeitos colaterais
 */

import { User } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class GetCurrentUserUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    /**
     * Obtém o usuário autenticado
     * @returns User ou null se não autenticado
     */
    async execute(): Promise<User | null> {
        return await this.authRepository.getCurrentUser();
    }
}
