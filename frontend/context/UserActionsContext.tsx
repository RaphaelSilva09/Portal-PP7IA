"use client";

import { AuthError } from "@/domain/errors/AuthError";
import DIContainer from "@/infrastructure/di/container";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";

/**
 * UserActionsContext - Responsável apenas por ações de gerenciamento de usuário
 *
 * Princípios aplicados:
 * - SRP: Única responsabilidade - operações de gerenciamento de usuário
 * - ISP: Interface específica apenas para ações de usuário
 * - Clean Architecture: Camada de apresentação isolada de regras de negócio
 */

interface UserActionsContextType {
    isLoading: boolean;
    error: string | null;
    updateEmail: (newEmail: string) => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    updatePreferences: (acceptEmail: boolean, acceptWhatsApp: boolean) => Promise<void>;
    updateProfile: (nome: string, email: string, celular: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    resetPasswordWithToken: (newPassword: string, confirmPassword: string) => Promise<void>;
    clearError: () => void;
}

const UserActionsContext = createContext<UserActionsContextType | null>(null);

interface UserActionsProviderProps {
    children: ReactNode;
}

export function UserActionsProvider({ children }: UserActionsProviderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Limpa mensagens de erro
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Atualiza email do usuário
     * Requer confirmação no novo email
     */
    const updateEmail = useCallback(async (newEmail: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const repository = DIContainer.getAuthRepository();
            await repository.updateEmail({ newEmail });
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao atualizar email.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Atualiza senha do usuário
     * Requer senha atual para validação
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
     * Atualiza preferências de comunicação do usuário
     */
    const updatePreferences = useCallback(async (acceptEmail: boolean, acceptWhatsApp: boolean) => {
        setIsLoading(true);
        setError(null);

        try {
            const repository = DIContainer.getAuthRepository();
            await repository.updatePreferences({
                acceptEmailUpdates: acceptEmail,
                acceptWhatsAppUpdates: acceptWhatsApp,
            });
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao atualizar preferências.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Atualiza perfil do usuário (nome, email, celular)
     */
    const updateProfile = useCallback(async (nome: string, email: string, celular: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const repository = DIContainer.getAuthRepository();
            await repository.updateProfile({ nome, email, celular });
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao atualizar perfil.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Deleta conta do usuário (soft delete)
     * Marca como inativa mas mantém dados para conformidade
     */
    const deleteAccount = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const repository = DIContainer.getAuthRepository();
            await repository.deleteAccount();
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao deletar conta.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Envia email de recuperação de senha
     * Usuário receberá link com token de reset
     */
    const sendPasswordReset = useCallback(async (email: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const useCase = DIContainer.getSendPasswordResetUseCase();
            await useCase.execute({ email });
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao enviar email de recuperação.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Redefine senha com token de recuperação (enviado por email)
     * OTIMIZAÇÃO: onAuthStateChange detecta a mudança automaticamente
     */
    const resetPasswordWithToken = useCallback(async (newPassword: string, confirmPassword: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const useCase = DIContainer.getResetPasswordWithTokenUseCase();
            await useCase.execute({ newPassword, confirmPassword });
            // onAuthStateChange vai atualizar o usuário automaticamente após o reset
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao redefinir senha. Tente novamente.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <UserActionsContext.Provider
            value={{
                isLoading,
                error,
                updateEmail,
                updatePassword,
                updatePreferences,
                updateProfile,
                deleteAccount,
                sendPasswordReset,
                resetPasswordWithToken,
                clearError,
            }}
        >
            {children}
        </UserActionsContext.Provider>
    );
}

/**
 * Hook para acessar o contexto de ações de usuário
 */
export function useUserActions(): UserActionsContextType {
    const context = useContext(UserActionsContext);

    if (!context) {
        throw new Error("useUserActions deve ser usado dentro de um UserActionsProvider");
    }

    return context;
}
