"use client";

import { User } from "@/domain/entities/User";
import { AuthError } from "@/domain/errors/AuthError";
import type { SignInParams, SignUpParams } from "@/domain/repositories/IAuthRepository";
import DIContainer from "@/infrastructure/di/container";
import { authClient } from "@/lib/auth-client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

interface SessionContextType {
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

const SessionContext = createContext<SessionContextType | null>(null);

interface SessionProviderProps {
    children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

    const session = authClient.useSession();
    const sessionData = session.data;
    const isPending = session.isPending;

    useEffect(() => {
        if (!sessionData?.user) {
            setUser(null);
            return;
        }
        try {
            const u = sessionData.user as Record<string, unknown>;
            const acceptEmail = (u.accept_email_updates as boolean | null) ?? true;
            const acceptWA = (u.accept_whatsapp_updates as boolean | null) ?? false;
            const mapped = User.create({
                id: u.id as string,
                email: u.email as string,
                nome: ((u.nome as string | null) ?? (u.name as string | null) ?? "") || (u.email as string),
                celular: (u.celular as string | null) ?? "",
                acceptEmailUpdates: acceptEmail || (!acceptEmail && !acceptWA),
                acceptWhatsAppUpdates: acceptWA,
                createdAt: u.createdAt ? new Date(u.createdAt as string) : new Date(),
                role: ((u.role as string | null) ?? "user") || "user",
            });
            setUser(mapped);
        } catch {
            setUser(null);
        }
    }, [sessionData]);

    const clearError = useCallback(() => setError(null), []);

    const signUp = useCallback(
        async (params: SignUpParams): Promise<{ emailConfirmationRequired: boolean }> => {
            setError(null);
            setEmailConfirmationRequired(false);
            try {
                const useCase = DIContainer.getSignUpUseCase();
                const result = await useCase.execute(params);
                setEmailConfirmationRequired(result.emailConfirmationRequired ?? false);
                return { emailConfirmationRequired: result.emailConfirmationRequired ?? false };
            } catch (err) {
                const msg = err instanceof AuthError ? err.message : "Erro ao cadastrar usuário.";
                setError(msg);
                throw err;
            }
        },
        [],
    );

    const signIn = useCallback(async (params: SignInParams): Promise<void> => {
        setError(null);
        try {
            const useCase = DIContainer.getSignInUseCase();
            await useCase.execute(params);
        } catch (err) {
            const msg = err instanceof AuthError ? err.message : "Erro ao fazer login.";
            setError(msg);
            throw err;
        }
    }, []);

    const signOut = useCallback(async (): Promise<void> => {
        setError(null);
        try {
            const useCase = DIContainer.getSignOutUseCase();
            await useCase.execute();
        } catch (err) {
            const msg = err instanceof AuthError ? err.message : "Erro ao fazer logout.";
            setError(msg);
            throw err;
        }
    }, []);

    const getCurrentUser = useCallback(async (): Promise<void> => {
        setError(null);
        try {
            const repo = DIContainer.getAuthRepository();
            const userData = await repo.getCurrentUser();
            setUser(userData);
        } catch (err) {
            const msg = err instanceof AuthError ? err.message : "Erro ao buscar usuário.";
            setError(msg);
            setUser(null);
            throw err;
        }
    }, []);

    return (
        <SessionContext.Provider
            value={{
                user,
                isLoading: isPending,
                error,
                emailConfirmationRequired,
                signUp,
                signIn,
                signOut,
                getCurrentUser,
                clearError,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}

export function useSession(): SessionContextType {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession deve ser usado dentro de um SessionProvider");
    }
    return context;
}
