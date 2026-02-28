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
     * Faz validação JWT servidor (round-trip). Preferir getUserFromSession quando possível.
     * @returns User ou null se não autenticado
     */
    getCurrentUser(): Promise<User | null>;

    /**
     * Obtém perfil do usuário a partir de dados da sessão (sem round-trip ao servidor Auth).
     * Uso ideal: onAuthStateChange handlers onde a sessão já foi validada pelo Supabase.
     * @param userId ID do usuário da sessão
     * @param role Role do app_metadata da sessão
     * @returns User ou null se perfil não encontrado
     */
    getUserFromSession(userId: string, role: string): Promise<User | null>;

    /**
     * Envia email de reset de senha com código OTP de 8 dígitos
     */
    sendPasswordReset(email: string): Promise<void>;

    /**
     * Verifica código OTP de recuperação de senha
     * @param params Email e token OTP de 8 dígitos
     * @throws InvalidOTPError se código inválido
     * @throws OTPExpiredError se código expirado
     */
    verifyPasswordResetOTP(params: { email: string; token: string }): Promise<void>;

    /**
     * Redefine a senha usando sessão OTP ativa
     * @param newPassword Nova senha do usuário
     * @deprecated Use verifyPasswordResetOTP + resetPasswordWithOTP
     */
    resetPasswordWithToken(newPassword: string): Promise<void>;

    /**
     * Redefine a senha após verificação OTP bem-sucedida
     * @param newPassword Nova senha do usuário
     * @requires Sessão OTP ativa (verifyPasswordResetOTP deve ser chamado antes)
     */
    resetPasswordWithOTP(newPassword: string): Promise<void>;

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
