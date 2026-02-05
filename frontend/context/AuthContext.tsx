"use client";

import { User } from "@/domain/entities/User";
import { AuthError } from "@/domain/errors/AuthError";
import DIContainer from "@/infrastructure/di/container";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * AuthContext - Contexto Global de Autenticação
 *
 * Gerencia o estado do usuário de forma global, permitindo que todos
 * os componentes acessem o mesmo estado de autenticação.
 *
 * Princípios aplicados:
 * - Single Source of Truth: Estado único compartilhado
 * - Context Pattern: Evita prop drilling
 * - Clean Architecture: Usa casos de uso via DI Container
 */

interface SignUpParams {
    email: string;
    password: string;
    nome: string;
    celular: string;
    acceptEmailUpdates: boolean;
    acceptWhatsAppUpdates: boolean;
}

interface SignInParams {
    email: string;
    password: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    emailConfirmationRequired: boolean;
    signUp: (params: SignUpParams) => Promise<{ emailConfirmationRequired: boolean }>;
    signIn: (params: SignInParams) => Promise<void>;
    signOut: () => Promise<void>;
    getCurrentUser: () => Promise<void>;
    updateEmail: (newEmail: string) => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    updatePreferences: (acceptEmail: boolean, acceptWhatsApp: boolean) => Promise<void>;
    deleteAccount: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Começa true para verificar sessão
    const [error, setError] = useState<string | null>(null);
    const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

    /**
     * Obtém usuário atual da sessão
     */
    const getCurrentUser = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const getCurrentUserUseCase = DIContainer.getCurrentUserUseCase();
            const currentUser = await getCurrentUserUseCase.execute();
            setUser(currentUser);
        } catch (err) {
            // Silenciosamente falha se não há usuário logado
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Verifica sessão existente ao montar
    useEffect(() => {
        getCurrentUser();
    }, [getCurrentUser]);

    /**
     * Cadastra novo usuário
     */
    const signUp = useCallback(async (params: SignUpParams) => {
        setIsLoading(true);
        setError(null);
        setEmailConfirmationRequired(false);

        try {
            const signUpUseCase = DIContainer.getSignUpUseCase();
            const result = await signUpUseCase.execute(params);
            setUser(result.user);

            const requiresConfirmation = result.emailConfirmationRequired ?? false;
            if (requiresConfirmation) {
                setEmailConfirmationRequired(true);
            }

            return { emailConfirmationRequired: requiresConfirmation };
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao cadastrar. Tente novamente.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Autentica usuário
     */
    const signIn = useCallback(async (params: SignInParams) => {
        setIsLoading(true);
        setError(null);

        try {
            const signInUseCase = DIContainer.getSignInUseCase();
            const result = await signInUseCase.execute(params);
            setUser(result.user);
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao fazer login. Tente novamente.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Desautentica usuário
     */
    const signOut = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const signOutUseCase = DIContainer.getSignOutUseCase();
            await signOutUseCase.execute();
            setUser(null);
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao sair. Tente novamente.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Atualiza email do usuário
     */
    const updateEmail = useCallback(
        async (newEmail: string) => {
            setIsLoading(true);
            setError(null);

            try {
                const repository = DIContainer.getAuthRepository();
                await repository.updateEmail({ newEmail });
                await getCurrentUser();
            } catch (err) {
                const errorMessage = err instanceof AuthError ? err.message : "Erro ao atualizar email.";
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [getCurrentUser],
    );

    /**
     * Atualiza senha do usuário
     */
    const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const repository = DIContainer.getAuthRepository();
            await repository.updatePassword({ currentPassword, newPassword });
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao atualizar senha.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Atualiza preferências de notificação
     */
    const updatePreferences = useCallback(
        async (acceptEmail: boolean, acceptWhatsApp: boolean) => {
            setIsLoading(true);
            setError(null);

            try {
                const repository = DIContainer.getAuthRepository();
                await repository.updatePreferences({
                    acceptEmailUpdates: acceptEmail,
                    acceptWhatsAppUpdates: acceptWhatsApp,
                });
                await getCurrentUser();
            } catch (err) {
                const errorMessage = err instanceof AuthError ? err.message : "Erro ao atualizar preferências.";
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [getCurrentUser],
    );

    /**
     * Deleta conta do usuário
     */
    const deleteAccount = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const repository = DIContainer.getAuthRepository();
            await repository.deleteAccount();
            setUser(null);
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao deletar conta.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                error,
                emailConfirmationRequired,
                signUp,
                signIn,
                signOut,
                getCurrentUser,
                updateEmail,
                updatePassword,
                updatePreferences,
                deleteAccount,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook para acessar o contexto de autenticação
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }

    return context;
}
