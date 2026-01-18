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
    EmailNotConfirmedError,
    InvalidCredentialsError,
    NetworkError,
    UnknownAuthError,
    UserAlreadyExistsError,
    WeakPasswordError,
} from "../../domain/errors/AuthError";
import { AuthResult, IAuthRepository, SignInParams, SignUpParams } from "../../domain/repositories/IAuthRepository";

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

            // Se session é null, significa que confirmação de email está habilitada
            const requiresEmailConfirmation = !authData.session;

            // 2. Busca o perfil criado pelo trigger
            const { data: userData, error: userError } = await this.supabase
                .from("users")
                .select("*")
                .eq("id", authData.user.id)
                .single();

            if (userError || !userData) {
                // Fallback: usa dados fornecidos se perfil não foi encontrado
                const user = this.mapToUser(authData.user.id, {
                    email: params.email,
                    nome: params.nome,
                    celular: params.celular,
                    acceptEmailUpdates: params.acceptEmailUpdates,
                    acceptWhatsAppUpdates: params.acceptWhatsAppUpdates,
                    createdAt: new Date(),
                });

                return {
                    user,
                    session: authData.session ? {
                        accessToken: authData.session.access_token,
                        refreshToken: authData.session.refresh_token,
                    } : null,
                    emailConfirmationRequired: requiresEmailConfirmation,
                };
            }

            // 3. Converte dados do perfil para entidade de domínio
            const user = this.mapToUser(authData.user.id, {
                email: userData.email,
                nome: userData.nome,
                celular: userData.celular,
                acceptEmailUpdates: userData.accept_email_updates,
                acceptWhatsAppUpdates: userData.accept_whatsapp_updates,
                createdAt: new Date(userData.created_at),
            });

            return {
                user,
                session: authData.session ? {
                    accessToken: authData.session.access_token,
                    refreshToken: authData.session.refresh_token,
                } : null,
                emailConfirmationRequired: requiresEmailConfirmation,
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

            return this.mapToUser(authUser.id, {
                email: userData.email,
                nome: userData.nome,
                celular: userData.celular,
                acceptEmailUpdates: userData.accept_email_updates,
                acceptWhatsAppUpdates: userData.accept_whatsapp_updates,
                createdAt: new Date(userData.created_at),
            });
        } catch {
            return null;
        }
    }

    /**
     * Envia email de reset de senha
     */
    async sendPasswordReset(email: string): Promise<void> {
        const { error } = await this.supabase.auth.resetPasswordForEmail(email);
        if (error) {
            throw this.mapSupabaseError(error);
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

        if (message.includes("password") && message.includes("weak")) {
            return new WeakPasswordError();
        }

        if (code === "NETWORK_ERROR" || message.includes("network")) {
            return new NetworkError();
        }

        return new UnknownAuthError(error.message);
    }
}
