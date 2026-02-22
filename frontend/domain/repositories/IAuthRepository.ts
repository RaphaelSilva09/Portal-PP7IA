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

export interface UpdateEmailParams {
    newEmail: string;
}

export interface UpdatePasswordParams {
    currentPassword: string;
    newPassword: string;
}

export interface UpdatePreferencesParams {
    acceptEmailUpdates: boolean;
    acceptWhatsAppUpdates: boolean;
}

export interface AuthResult {
    user: User;
    session: {
        accessToken: string;
        refreshToken: string;
    } | null; // Null quando confirmação de email está habilitada
    emailConfirmationRequired?: boolean; // True se usuário precisa confirmar email
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

    /**
     * Redefine a senha usando token de reset
     * @param newPassword Nova senha do usuário
     */
    resetPasswordWithToken(newPassword: string): Promise<void>;

    /**
     * Atualiza o email do usuário
     */
    updateEmail(params: UpdateEmailParams): Promise<void>;

    /**
     * Atualiza a senha do usuário
     */
    updatePassword(params: UpdatePasswordParams): Promise<void>;

    /**
     * Atualiza preferências de notificação
     */
    updatePreferences(params: UpdatePreferencesParams): Promise<void>;

    /**
     * Deleta a conta do usuário
     */
    deleteAccount(): Promise<void>;
}
