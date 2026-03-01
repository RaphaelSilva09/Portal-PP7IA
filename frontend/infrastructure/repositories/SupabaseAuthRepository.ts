/**
 * SupabaseAuthRepository (Infrastructure Layer)
 *
 * Implementação concreta do IAuthRepository usando Supabase.
 * Esta é a camada de infraestrutura que lida com detalhes técnicos.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta a API do Supabase para nosso domínio
 * - SRP: Responsável apenas pela comunicação com Supabase
 * - Clean Architecture: Camada externa que pode ser substituída
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { User, UserProps } from "../../domain/entities/User";
import {
    AuthError,
    EmailNotConfirmedError,
    InvalidCredentialsError,
    NetworkError,
    UnknownAuthError,
    UserAlreadyExistsError,
    WeakPasswordError,
} from "../../domain/errors/AuthError";
import {
    AuthResult,
    IAuthRepository,
    SignInParams,
    SignUpParams,
    UpdateProfileParams,
} from "../../domain/repositories/IAuthRepository";

/**
 * Adapter Pattern: Adapta Supabase para nossa interface de domínio
 */
export class SupabaseAuthRepository implements IAuthRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    /**
     * Cadastra novo usuário no Supabase
     * O perfil em public.users é criado automaticamente via trigger
     */
    async signUp(params: SignUpParams): Promise<AuthResult> {
        try {
            // 1. Cria usuário no Supabase Auth
            // O trigger handle_new_user() vai criar o perfil automaticamente
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email: params.email,
                password: params.password,
                options: {
                    data: {
                        nome: params.nome,
                        celular: params.celular,
                        accept_email_updates: params.acceptEmailUpdates,
                        accept_whatsapp_updates: params.acceptWhatsAppUpdates,
                    },
                },
            });

            if (authError) {
                throw this.mapSupabaseError(authError);
            }

            if (!authData.user) {
                throw new UnknownAuthError("Falha ao criar usuário");
            }

            // IMPORTANTE: Quando o Supabase tem confirmação de email habilitada
            // e o usuário já existe, ele retorna success mas com:
            // - session = null
            // - user.identities = [] (array vazio)
            // Isso indica que o usuário já existe, não que precisa confirmar email
            const userAlreadyExists = authData.user.identities && authData.user.identities.length === 0;

            if (userAlreadyExists) {
                throw new UserAlreadyExistsError();
            }

            // Se session é null, significa que confirmação de email está habilitada
            const requiresEmailConfirmation = !authData.session;

            // 2. Busca o perfil criado pelo trigger
            // Nota: Quando email confirmation está habilitado (session = null),
            // não há sessão ativa e a política RLS bloqueia a query.
            // Nesses casos, usamos os dados fornecidos diretamente.
            if (requiresEmailConfirmation) {
                // Email confirmation necessário: usa dados fornecidos
                const user = this.mapToUser(authData.user.id, {
                    email: params.email,
                    nome: params.nome,
                    celular: params.celular,
                    acceptEmailUpdates: params.acceptEmailUpdates,
                    acceptWhatsAppUpdates: params.acceptWhatsAppUpdates,
                    createdAt: new Date(),
                    role: "user",
                });

                return {
                    user,
                    session: null,
                    emailConfirmationRequired: true,
                };
            }

            // Sessão criada: busca perfil do banco
            if (!authData.session) {
                throw new UnknownAuthError("Sessão não criada inesperadamente");
            }

            const { data: userData, error: userError } = await this.supabase
                .from("users")
                .select("*")
                .eq("id", authData.user.id)
                .single();

            if (userError || !userData) {
                throw new UnknownAuthError("Falha ao recuperar perfil do usuário");
            }

            // 3. Converte dados do perfil para entidade de domínio
            const user = this.mapToUser(authData.user.id, {
                email: userData.email,
                nome: userData.nome,
                celular: userData.celular,
                acceptEmailUpdates: userData.accept_email_updates,
                acceptWhatsAppUpdates: userData.accept_whatsapp_updates,
                createdAt: new Date(userData.created_at),
                role: "user",
            });

            return {
                user,
                session: {
                    accessToken: authData.session.access_token,
                    refreshToken: authData.session.refresh_token,
                },
                emailConfirmationRequired: false,
            };
        } catch (error) {
            if (error instanceof Error && "status" in error) {
                throw this.mapSupabaseError(error);
            }
            throw error;
        }
    }

    /**
     * Autentica usuário existente
     */
    async signIn(params: SignInParams): Promise<AuthResult> {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: params.email,
                password: params.password,
            });

            if (error) {
                throw this.mapSupabaseError(error);
            }

            if (!data.user || !data.session) {
                throw new InvalidCredentialsError();
            }

            // Busca dados completos do usuário
            const { data: userData, error: userError } = await this.supabase
                .from("users")
                .select("*")
                .eq("id", data.user.id)
                .single();

            if (userError || !userData) {
                throw new UnknownAuthError("Falha ao recuperar dados do usuário");
            }

            const user = this.mapToUser(data.user.id, {
                email: userData.email,
                nome: userData.nome,
                celular: userData.celular,
                acceptEmailUpdates: userData.accept_email_updates,
                acceptWhatsAppUpdates: userData.accept_whatsapp_updates,
                createdAt: new Date(userData.created_at),
                role: "user",
            });

            return {
                user,
                session: {
                    accessToken: data.session.access_token,
                    refreshToken: data.session.refresh_token,
                },
            };
        } catch (error) {
            if (error instanceof Error && "status" in error) {
                throw this.mapSupabaseError(error);
            }
            throw error;
        }
    }

    /**
     * Desautentica usuário
     */
    async signOut(): Promise<void> {
        const { error } = await this.supabase.auth.signOut();
        if (error) {
            throw this.mapSupabaseError(error);
        }
    }

    /**
     * Obtém usuário autenticado atual
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            const {
                data: { user: authUser },
            } = await this.supabase.auth.getUser();

            if (!authUser) {
                return null;
            }

            const { data: userData, error } = await this.supabase
                .from("users")
                .select("*")
                .eq("id", authUser.id)
                .single();

            if (error || !userData) {
                return null;
            }

            // Mapeia role do app_metadata (definido no JWT pelo Supabase)
            const role = (authUser.app_metadata?.role as string) || "user";

            return this.mapToUser(authUser.id, {
                email: userData.email,
                nome: userData.nome,
                celular: userData.celular,
                acceptEmailUpdates: userData.accept_email_updates,
                acceptWhatsAppUpdates: userData.accept_whatsapp_updates,
                createdAt: new Date(userData.created_at),
                role,
            });
        } catch {
            return null;
        }
    }

    /**
     * Obtém perfil do usuário a partir de dados da sessão, sem validar JWT no servidor.
     * Mais eficiente que getCurrentUser() para uso em onAuthStateChange onde a sessão
     * já foi validada pelo Supabase internamente.
     */
    async getUserFromSession(userId: string, role: string): Promise<User | null> {
        try {
            const { data: userData, error } = await this.supabase.from("users").select("*").eq("id", userId).single();

            if (error || !userData) {
                return null;
            }

            return this.mapToUser(userId, {
                email: userData.email,
                nome: userData.nome,
                celular: userData.celular,
                acceptEmailUpdates: userData.accept_email_updates,
                acceptWhatsAppUpdates: userData.accept_whatsapp_updates,
                createdAt: new Date(userData.created_at),
                role,
            });
        } catch {
            return null;
        }
    }

    /**
     * Envia email de reset de senha com código OTP de 8 dígitos
     * OTP expira em 1 hora (configurado no Supabase Dashboard)
     */
    async sendPasswordReset(email: string): Promise<void> {
        const { error } = await this.supabase.auth.resetPasswordForEmail(email);
        if (error) {
            throw this.mapSupabaseError(error);
        }
    }

    /**
     * Verifica código OTP de recuperação de senha
     * Estabelece sessão temporária se código válido
     */
    async verifyPasswordResetOTP(params: { email: string; token: string }): Promise<void> {
        const { error } = await this.supabase.auth.verifyOtp({
            email: params.email,
            token: params.token,
            type: "recovery",
        });

        if (error) {
            // Mapeia erros específicos de OTP
            if (error.message.includes("expired") || error.message.includes("Token has expired")) {
                throw new UnknownAuthError("Código expirado. Solicite um novo código.");
            }
            if (error.message.includes("invalid") || error.message.includes("Invalid")) {
                throw new UnknownAuthError("Código inválido. Verifique e tente novamente.");
            }
            throw this.mapSupabaseError(error);
        }
    }

    /**
     * @deprecated Use verifyPasswordResetOTP + resetPasswordWithOTP
     * Redefine a senha usando token de recuperação (link-based flow - LEGACY)
     */
    async resetPasswordWithToken(newPassword: string): Promise<void> {
        try {
            console.log("🔗 resetPasswordWithToken chamado (DEPRECATED)");
            const { data, error } = await this.supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                throw this.mapSupabaseError(error);
            }

            if (!data.user) {
                console.error("⚠️ updateUser retornou sem data.user");
                throw new UnknownAuthError("Falha ao atualizar senha");
            }

            console.log("✅ resetPasswordWithToken concluído (LEGACY)");
        } catch (error) {
            if (error instanceof Error && "status" in error) {
                throw this.mapSupabaseError(error);
            }
            throw error;
        }
    }

    /**
     * Redefine a senha após verificação OTP bem-sucedida
     * Requer sessão ativa estabelecida por verifyPasswordResetOTP
     */
    async resetPasswordWithOTP(newPassword: string): Promise<void> {
        try {
            console.log("🔐 resetPasswordWithOTP chamado");
            const { data, error } = await this.supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                throw this.mapSupabaseError(error);
            }

            if (!data.user) {
                console.error("⚠️ updateUser retornou sem data.user");
                throw new UnknownAuthError("Falha ao atualizar senha");
            }

            console.log("✅ resetPasswordWithOTP concluído com sucesso");
        } catch (error) {
            if (error instanceof Error && "status" in error) {
                throw this.mapSupabaseError(error);
            }
            throw error;
        }
    }

    /**
     * Atualiza o email do usuário
     */
    async updateEmail(params: { newEmail: string }): Promise<void> {
        try {
            const { error } = await this.supabase.auth.updateUser({
                email: params.newEmail,
            });

            if (error) {
                throw this.mapSupabaseError(error);
            }

            // Atualiza também na tabela users
            const {
                data: { user },
            } = await this.supabase.auth.getUser();
            if (user) {
                await this.supabase.from("users").update({ email: params.newEmail }).eq("id", user.id);
            }
        } catch (error) {
            if (error instanceof Error && "status" in error) {
                throw this.mapSupabaseError(error);
            }
            throw error;
        }
    }

    /**
     * Atualiza a senha do usuário
     *
     * IMPORTANTE: Para alterar senha, o Supabase requer que o usuário:
     * 1. Esteja autenticado (sessão ativa)
     * 2. Por segurança adicional, verificamos a senha atual via signInWithPassword
     *
     * Comportamento depende da configuração "Secure password change":
     * - Desabilitado: Senha muda imediatamente
     * - Habilitado: Envia email de confirmação, senha muda após clicar no link
     *
     * Retorno: Promise que sempre resolve com sucesso. A senha é atualizada imediatamente
     * no Supabase (não há flag de "email_confirmation_sent" para password changes).
     */
    async updatePassword(params: { currentPassword: string; newPassword: string }): Promise<void> {
        try {
            console.log("🔐 updatePassword chamado");
            const {
                data: { user },
            } = await this.supabase.auth.getUser();

            if (!user?.email) {
                throw new UnknownAuthError("Usuário não autenticado");
            }

            // Verifica se a senha atual está correta
            // Nota: Este signInWithPassword cria uma nova sessão, mas o Supabase
            // gerencia isso automaticamente sem duplicar o usuário
            const { error: verifyError } = await this.supabase.auth.signInWithPassword({
                email: user.email,
                password: params.currentPassword,
            });

            if (verifyError) {
                throw new InvalidCredentialsError();
            }

            // Atualiza a senha
            // Nota: Com "Secure password change" desabilitado, a senha muda imediatamente
            // e um email de confirmação é enviado ao usuário.
            const { data, error: updateError } = await this.supabase.auth.updateUser({
                password: params.newPassword,
            });

            if (updateError) {
                throw this.mapSupabaseError(updateError);
            }

            // Valida que o usuário foi atualizado com sucesso
            if (!data.user) {
                console.error("⚠️ updateUser retornou sem data.user");
                throw new UnknownAuthError("Falha ao atualizar senha");
            }

            console.log("✅ updatePassword concluído com sucesso");
        } catch (error) {
            if (error instanceof AuthError) {
                throw error;
            }
            if (error instanceof Error && "status" in error) {
                throw this.mapSupabaseError(error);
            }
            throw error;
        }
    }

    /**
     * Atualiza preferências de notificação
     */
    async updatePreferences(params: { acceptEmailUpdates: boolean; acceptWhatsAppUpdates: boolean }): Promise<void> {
        try {
            const {
                data: { user },
            } = await this.supabase.auth.getUser();
            if (!user) {
                throw new UnknownAuthError("Usuário não autenticado");
            }

            const { error } = await this.supabase
                .from("users")
                .update({
                    accept_email_updates: params.acceptEmailUpdates,
                    accept_whatsapp_updates: params.acceptWhatsAppUpdates,
                })
                .eq("id", user.id);

            if (error) {
                throw this.mapSupabaseError(error);
            }
        } catch (error) {
            if (error instanceof Error && "status" in error) {
                throw this.mapSupabaseError(error);
            }
            throw error;
        }
    }

    /**
     * Deleta a conta do usuário
     */
    async deleteAccount(): Promise<void> {
        try {
            const {
                data: { user },
            } = await this.supabase.auth.getUser();
            if (!user) {
                throw new UnknownAuthError("Usuário não autenticado");
            }

            // Primeiro deleta o perfil (o RLS permite que o usuário delete seu próprio perfil)
            const { error: profileError } = await this.supabase.from("users").delete().eq("id", user.id);

            if (profileError) {
                throw this.mapSupabaseError(profileError);
            }

            // Faz signOut (a deleção completa do Auth requer um endpoint backend)
            await this.supabase.auth.signOut();
        } catch (error) {
            if (error instanceof Error && "status" in error) {
                throw this.mapSupabaseError(error);
            }
            throw error;
        }
    }

    /**
     * Atualiza perfil do usuário (nome, email, celular)
     * Se o email mudou, atualiza também em auth.users via updateUser
     */
    async updateProfile(params: UpdateProfileParams): Promise<void> {
        try {
            const {
                data: { user },
            } = await this.supabase.auth.getUser();
            if (!user) {
                throw new UnknownAuthError("Usuário não autenticado");
            }

            // Atualiza email no auth se mudou
            if (params.email && params.email !== user.email) {
                const { error: authError } = await this.supabase.auth.updateUser({
                    email: params.email,
                });
                if (authError) {
                    throw this.mapSupabaseError(authError);
                }
            }

            // Atualiza nome, email e celular na tabela public.users
            const { error: dbError } = await this.supabase
                .from("users")
                .update({
                    nome: params.nome,
                    email: params.email,
                    celular: params.celular,
                })
                .eq("id", user.id);

            if (dbError) {
                throw this.mapSupabaseError(dbError);
            }
        } catch (error) {
            if (error instanceof AuthError) {
                throw error;
            }
            if (error instanceof Error && "status" in error) {
                throw this.mapSupabaseError(error);
            }
            throw error;
        }
    }

    /**
     * Mapeia dados brutos para entidade User do domínio
     * Adapter Pattern: Traduz formato externo para domínio
     */
    private mapToUser(id: string, data: Omit<UserProps, "id">): User {
        return User.create({
            id,
            ...data,
        });
    }

    /**
     * Mapeia erros do Supabase para erros de domínio
     * Error Handling: Traduz erros técnicos para erros de negócio
     */
    private mapSupabaseError(error: any): Error {
        const message = error.message?.toLowerCase() || "";
        const code = error.code || error.status;

        // Mapeamento de erros comuns do Supabase
        if (message.includes("user already registered") || code === "23505") {
            return new UserAlreadyExistsError();
        }

        if (message.includes("invalid login credentials") || message.includes("invalid password")) {
            return new InvalidCredentialsError();
        }

        if (message.includes("email not confirmed")) {
            return new EmailNotConfirmedError();
        }

        // Erros relacionados a senha - traduz para português
        if (message.includes("password")) {
            const translatedMessage = this.translatePasswordError(error.message);
            return new WeakPasswordError(translatedMessage);
        }

        if (code === "NETWORK_ERROR" || message.includes("network")) {
            return new NetworkError();
        }

        return new UnknownAuthError(error.message);
    }

    /**
     * Traduz mensagens de erro de senha do Supabase para português
     */
    private translatePasswordError(originalMessage: string): string {
        const msg = originalMessage?.toLowerCase() || "";

        // Mensagem completa de requisitos de senha do Supabase
        if (msg.includes("should contain at least one character of each")) {
            return "A senha deve conter pelo menos: uma letra minúscula, uma letra maiúscula, um número e um caractere especial (!@#$%^&*). Escolha uma senha mais forte.";
        }

        // Senha fraca/conhecida
        if (msg.includes("weak and easy to guess")) {
            return "Esta senha é muito comum e fácil de adivinhar. Escolha uma senha mais forte.";
        }

        // Tamanho mínimo
        if (msg.includes("at least") && msg.includes("character")) {
            const match = msg.match(/at least (\d+)/);
            const minLength = match ? match[1] : "6";
            return `A senha deve ter no mínimo ${minLength} caracteres.`;
        }

        // Retorna mensagem original se não houver tradução específica
        return originalMessage;
    }
}
