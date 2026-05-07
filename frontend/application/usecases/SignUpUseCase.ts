/**
 * SignUpUseCase (Application Layer)
 *
 * Caso de uso para cadastro de novos usuários.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pelo fluxo de cadastro
 * - DIP: Depende de abstração (IAuthRepository), não de implementação
 * - Clean Architecture: Caso de uso orquestra regras de negócio
 * - Command Pattern: Encapsula uma operação como objeto
 */

import { User } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export interface SignUpInput {
    email: string;
    password: string;
    nome: string;
    celular: string;
    acceptEmailUpdates: boolean;
}

export interface SignUpOutput {
    user: User;
    accessToken: string | null;
    emailConfirmationRequired?: boolean;
}

/**
 * Use Case Pattern: Encapsula lógica de aplicação
 */
export class SignUpUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    /**
     * Executa o caso de uso de cadastro
     *
     * @param input Dados do novo usuário
     * @returns Usuário criado e token de acesso
     * @throws UserAlreadyExistsError se email já cadastrado
     * @throws WeakPasswordError se senha fraca
     * @throws Error erros de validação da entidade User
     */
    async execute(input: SignUpInput): Promise<SignUpOutput> {
        // Validação básica de entrada
        this.validateInput(input);

        // Delega para o repositório (camada de infraestrutura)
        const result = await this.authRepository.signUp({
            email: input.email.trim().toLowerCase(),
            password: input.password,
            nome: input.nome.trim(),
            celular: input.celular,
            acceptEmailUpdates: input.acceptEmailUpdates,
        });

        return {
            user: result.user,
            accessToken: result.session?.accessToken ?? null,
            emailConfirmationRequired: result.emailConfirmationRequired,
        };
    }

    /**
     * Validação de entrada do caso de uso
     * Tell, Don't Ask: Valida e lança erro se inválido
     */
    private validateInput(input: SignUpInput): void {
        if (!input.email || !input.password || !input.nome || !input.celular) {
            throw new Error("Todos os campos obrigatórios devem ser preenchidos");
        }

        if (!input.acceptEmailUpdates) {
            throw new Error("Aceite receber atualizações por e-mail para continuar");
        }
    }
}
