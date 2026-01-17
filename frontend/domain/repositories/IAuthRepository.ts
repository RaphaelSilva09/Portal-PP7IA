/**
 * IAuthRepository Interface (Domain Layer)
 *
 * Define o contrato para o repositório de autenticação.
 * Esta é uma abstração (DIP - Dependency Inversion Principle).
 *
 * Princípios aplicados:
 * - DIP: Camada de domínio define a interface, infraestrutura implementa
 * - ISP: Interface segregada com operações específicas de autenticação
 * - Clean Architecture: Domínio não conhece detalhes de infraestrutura
 */

import { User } from "../entities/User";

export interface SignUpParams {
    email: string;
    password: string;
    nome: string;
    celular: string;
    acceptEmailUpdates: boolean;
    acceptWhatsAppUpdates: boolean;
}

export interface SignInParams {
    email: string;
    password: string;
}

export interface AuthResult {
    user: User;
    session: {
        accessToken: string;
        refreshToken: string;
    };
}

/**
 * Repository Pattern: Abstração para persistência de autenticação
 */
export interface IAuthRepository {
    /**
     * Cadastra um novo usuário
     * @throws UserAlreadyExistsError se o email já existe
     * @throws WeakPasswordError se a senha é fraca
     * @throws NetworkError em caso de erro de rede
     */
    signUp(params: SignUpParams): Promise<AuthResult>;

    /**
     * Autentica um usuário existente
     * @throws InvalidCredentialsError se credenciais inválidas
     * @throws EmailNotConfirmedError se email não confirmado
     * @throws NetworkError em caso de erro de rede
     */
    signIn(params: SignInParams): Promise<AuthResult>;

    /**
     * Desautentica o usuário atual
     */
    signOut(): Promise<void>;

    /**
     * Obtém o usuário autenticado atual
     * @returns User ou null se não autenticado
     */
    getCurrentUser(): Promise<User | null>;

    /**
     * Envia email de reset de senha
     */
    sendPasswordReset(email: string): Promise<void>;
}
