/**
 * useAuth Hook (Presentation Layer)
 *
 * Hook React para gerenciar autenticação.
 * Fornece interface simples para componentes consumirem casos de uso.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface complexa para componentes
 * - SRP: Responsável apenas por gerenciar estado de autenticação
 * - Clean Architecture: Camada de apresentação depende de casos de uso
 */

"use client";

import { useCallback, useState } from "react";
import { User } from "../../domain/entities/User";
import { AuthError } from "../../domain/errors/AuthError";
import DIContainer from "../../infrastructure/di/container";

interface UseAuthResult {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    emailConfirmationRequired: boolean;
    signUp: (params: SignUpParams) => Promise<{ emailConfirmationRequired: boolean }>;
    signIn: (params: SignInParams) => Promise<void>;
    signOut: () => Promise<void>;
    getCurrentUser: () => Promise<void>;
    clearError: () => void;
}

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

/**
 * Hook customizado para autenticação
 * Custom Hook Pattern
 */
export function useAuth(): UseAuthResult {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

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

            // Se confirmação de email é necessária, marca estado
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
     * Obtém usuário atual
     */
    const getCurrentUser = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const getCurrentUserUseCase = DIContainer.getCurrentUserUseCase();
            const currentUser = await getCurrentUserUseCase.execute();
            setUser(currentUser);
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao carregar usuário.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Limpa erro atual
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        user,
        isLoading,
        error,
        emailConfirmationRequired,
        signUp,
        signIn,
        signOut,
        getCurrentUser,
        clearError,
    };
}
