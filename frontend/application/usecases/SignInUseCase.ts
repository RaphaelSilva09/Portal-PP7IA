/**
 * SignInUseCase (Application Layer)
 *
 * Caso de uso para autenticação de usuários.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pelo fluxo de login
 * - DIP: Depende de abstração (IAuthRepository)
 * - Clean Architecture: Orquestra o domínio sem conhecer infraestrutura
 */

import { User } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export interface SignInInput {
    email: string;
    password: string;
}

export interface SignInOutput {
    user: User;
    accessToken: string | null;
}

export class SignInUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    /**
     * Executa o caso de uso de login
     *
     * @param input Credenciais do usuário
     * @returns Usuário autenticado e token de acesso
     * @throws InvalidCredentialsError se credenciais inválidas
     * @throws EmailNotConfirmedError se email não confirmado
     */
    async execute(input: SignInInput): Promise<SignInOutput> {
        this.validateInput(input);

        const result = await this.authRepository.signIn({
            email: input.email.trim().toLowerCase(),
            password: input.password,
        });

        return {
            user: result.user,
            accessToken: result.session?.accessToken ?? null,
        };
    }

    private validateInput(input: SignInInput): void {
        if (!input.email || !input.password) {
            throw new Error("Email e senha são obrigatórios");
        }
    }
}
