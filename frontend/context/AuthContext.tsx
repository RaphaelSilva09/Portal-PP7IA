"use client";

import { User } from "@/domain/entities/User";
import { ReactNode } from "react";
import { SessionProvider, useSession } from "./SessionContext";
import { UserActionsProvider, useUserActions } from "./UserActionsContext";

/**
 * AuthContext - Facade para SessionContext + UserActionsContext
 *
 * Mantém compatibilidade retroativa com o código existente
 * enquanto internamente usa a arquitetura refatorada.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface complexa
 * - Composite Pattern: Combina múltiplos provedores
 * - Clean Architecture: Camadas bem definidas
 * - SRP: Cada contexto tem uma responsabilidade
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
    sendPasswordReset: (email: string) => Promise<void>;
    resetPasswordWithToken: (newPassword: string, confirmPassword: string) => Promise<void>;
    clearError: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider - Wrapper que combina SessionProvider + UserActionsProvider
 * Fornece todos os providers necessários em um único ponto
 */
export function AuthProvider({ children }: AuthProviderProps) {
    return (
        <SessionProvider>
            <UserActionsProvider>{children}</UserActionsProvider>
        </SessionProvider>
    );
}

/**
 * useAuth - Hook facade que combina SessionContext + UserActionsContext
 *
 * Mantém compatibilidade com código existente enquanto usa
 * arquitetura refatorada internamente.
 *
 * IMPORTANTE: Este hook combina isLoading e error de ambos os contextos.
 * Se precisar de controle mais fino, use useSession() ou useUserActions() diretamente.
 */
export function useAuth(): AuthContextType {
    const session = useSession();
    const actions = useUserActions();

    // Combina loading states (se qualquer um está loading, o facade retorna true)
    const isLoading = session.isLoading || actions.isLoading;

    // Prioriza erro da sessão sobre erro das ações
    const error = session.error || actions.error;

    // Combina clearError de ambos os contextos
    const clearError = () => {
        session.clearError();
        actions.clearError();
    };

    return {
        // Dados de sessão
        user: session.user,
        isLoading,
        error,
        emailConfirmationRequired: session.emailConfirmationRequired,

        // Operações de sessão
        signUp: session.signUp,
        signIn: session.signIn,
        signOut: session.signOut,
        getCurrentUser: session.getCurrentUser,

        // Operações de usuário
        updateEmail: actions.updateEmail,
        updatePassword: actions.updatePassword,
        updatePreferences: actions.updatePreferences,
        deleteAccount: actions.deleteAccount,
        sendPasswordReset: actions.sendPasswordReset,
        resetPasswordWithToken: actions.resetPasswordWithToken,

        // Utilitários
        clearError,
    };
}
