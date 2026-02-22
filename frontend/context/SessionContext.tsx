"use client";

import type { User } from "@/domain/entities/User";
import type { SignInParams, SignUpParams } from "@/domain/repositories/IAuthRepository";
import { AuthError } from "@/domain/errors/AuthError";
import DIContainer from "@/infrastructure/di/container";
import { supabase } from "@/infrastructure/config/supabase";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

/**
 * SessionContext - Responsável apenas pela gestão de sessão
 * 
 * Princípios aplicados:
 * - SRP: Única responsabilidade - gerenciar estado da sessão
 * - ISP: Interface específica apenas para operações de sessão
 * - Clean Architecture: Camada de apresentação isolada de regras de negócio
 */

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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

    // Ref para evitar re-subscrições desnecessárias
    const userRef = useRef<User | null>(null);

    /**
     * Limpa mensagens de erro
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Busca sessão inicial do Supabase
     * Executa uma única vez no mount
     */
    const checkInitialSession = useCallback(async () => {
        const sessionLoadInProgress = true;
        console.log("🔍 Verificando sessão inicial...");

        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                const repository = DIContainer.getAuthRepository();
                const userData = await repository.getCurrentUser();

                if (userData) {
                    console.log("✅ Sessão restaurada:", userData.email);
                    setUser(userData);
                    userRef.current = userData;
                } else {
                    console.warn("⚠️ Sessão existe mas dados do usuário não encontrados");
                    setUser(null);
                    userRef.current = null;
                }
            } else {
                console.log("ℹ️ Nenhuma sessão encontrada");
                setUser(null);
                userRef.current = null;
            }
        } catch (err) {
            console.error("❌ Erro ao verificar sessão:", err);
            setUser(null);
            userRef.current = null;
        } finally {
            setIsLoading(false);
        }

        return sessionLoadInProgress;
    }, []);

    /**
     * Monitora mudanças de autenticação via Supabase
     */
    useEffect(() => {
        let mounted = true;
        let sessionLoadInProgress = false;

        // Carrega sessão inicial
        checkInitialSession().then(inProgress => {
            sessionLoadInProgress = inProgress;
        });

        // Listener para mudanças de auth state
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            if (sessionLoadInProgress) return; // Aguarda sessão inicial terminar

            // Só ignora SIGNED_IN se o userId é o mesmo (re-auth do mesmo usuário)
            // Não ignora se a sessão mudou (refresh de token, recovery, etc.)
            if (event === "SIGNED_IN" && userRef.current && session?.user?.id === userRef.current.id) {
                console.log(`ℹ️ SIGNED_IN ignorado - usuário ${userRef.current.email} já autenticado`);
                return;
            }

            console.log(`🔔 Auth event: ${event}`);

            if (event === "SIGNED_OUT") {
                console.log("👋 Usuário desconectado");
                setUser(null);
                userRef.current = null;
                setIsLoading(false);
                return;
            }

            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                try {
                    const repository = DIContainer.getAuthRepository();
                    const userData = await repository.getCurrentUser();

                    if (userData && mounted) {
                        console.log(`✅ Usuário autenticado: ${userData.email}`);
                        setUser(userData);
                        userRef.current = userData;
                    }
                } catch (err) {
                    console.error(`❌ Erro ao buscar usuário no ${event}:`, err);
                    if (mounted) {
                        setUser(null);
                        userRef.current = null;
                    }
                } finally {
                    if (mounted) {
                        setIsLoading(false);
                    }
                }
            }
        });

        // Cleanup
        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [checkInitialSession]);

    /**
     * Cadastra novo usuário
     */
    const signUp = useCallback(async (params: SignUpParams): Promise<{ emailConfirmationRequired: boolean }> => {
        setIsLoading(true);
        setError(null);
        setEmailConfirmationRequired(false);

        try {
            const useCase = DIContainer.getSignUpUseCase();
            const result = await useCase.execute(params);

            setEmailConfirmationRequired(result.emailConfirmationRequired ?? false);
            return { emailConfirmationRequired: result.emailConfirmationRequired ?? false };
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao cadastrar usuário.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Realiza login do usuário
     */
    const signIn = useCallback(async (params: SignInParams): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const useCase = DIContainer.getSignInUseCase();
            await useCase.execute(params);
            // onAuthStateChange vai atualizar o usuário automaticamente
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao fazer login.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Realiza logout do usuário
     */
    const signOut = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const useCase = DIContainer.getSignOutUseCase();
            await useCase.execute();
            // onAuthStateChange vai limpar o state automaticamente
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao fazer logout.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Busca dados do usuário atual
     * Útil para recarregar perfil após updates
     */
    const getCurrentUser = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const repository = DIContainer.getAuthRepository();
            const userData = await repository.getCurrentUser();

            if (userData) {
                setUser(userData);
                userRef.current = userData;
            } else {
                setUser(null);
                userRef.current = null;
            }
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao buscar usuário.";
            setError(errorMessage);
            setUser(null);
            userRef.current = null;
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <SessionContext.Provider
            value={{
                user,
                isLoading,
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

/**
 * Hook para acessar o contexto de sessão
 */
export function useSession(): SessionContextType {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error("useSession deve ser usado dentro de um SessionProvider");
    }

    return context;
}
