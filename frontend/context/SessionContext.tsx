"use client";

import type { User } from "@/domain/entities/User";
import { AuthError } from "@/domain/errors/AuthError";
import type { SignInParams, SignUpParams } from "@/domain/repositories/IAuthRepository";
import { supabase } from "@/infrastructure/config/supabase";
import DIContainer from "@/infrastructure/di/container";
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
     * Monitora mudanças de autenticação via Supabase
     * INITIAL_SESSION é sempre o primeiro evento — fonte única de verdade
     * Elimina race conditions de checkInitialSession paralelo
     *
     * GARANTIA DEFENSIVA: getSession() logo após registrar listener
     * para cobrir caso onde INITIAL_SESSION dispara antes do listener
     */
    useEffect(() => {
        let mounted = true;
        let initialSessionResolved = false;

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log(`🔔 Auth event: ${event}`);

            // INITIAL_SESSION é sempre o primeiro evento — fonte de verdade única
            if (event === "INITIAL_SESSION") {
                initialSessionResolved = true;
                if (session?.user) {
                    try {
                        const repository = DIContainer.getAuthRepository();
                        // Usa getUserFromSession (sem round-trip ao Auth server):
                        // a sessão já foi validada internamente pelo Supabase.
                        const role = (session.user.app_metadata?.role as string) || "user";
                        const userData = await repository.getUserFromSession(session.user.id, role);
                        if (mounted) {
                            console.log("✅ Sessão restaurada:", userData?.email);
                            setUser(userData);
                            userRef.current = userData;
                        }
                    } catch (err) {
                        console.error("❌ Erro ao restaurar sessão:", err);
                        if (mounted) {
                            setUser(null);
                            userRef.current = null;
                        }
                    }
                } else {
                    console.log("ℹ️ Nenhuma sessão encontrada");
                    setUser(null);
                    userRef.current = null;
                }
                if (mounted) setIsLoading(false);
                return;
            }

            // PASSWORD_RECOVERY é tratado pelo hook dedicado usePasswordRecovery
            if (event === "PASSWORD_RECOVERY") {
                console.log("ℹ️ PASSWORD_RECOVERY ignorado - tratado por usePasswordRecovery");
                return;
            }

            if (event === "SIGNED_OUT") {
                console.log("👋 Usuário desconectado");
                setUser(null);
                userRef.current = null;
                setIsLoading(false);
                return;
            }

            // Ignora SIGNED_IN se o userId é o mesmo (evita re-fetch desnecessário)
            if (event === "SIGNED_IN" && session?.user?.id === userRef.current?.id) {
                console.log(`ℹ️ SIGNED_IN ignorado - usuário ${userRef.current?.email} já autenticado`);
                setIsLoading(false);
                return;
            }

            if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
                try {
                    const repository = DIContainer.getAuthRepository();
                    // Usa getUserFromSession (sem round-trip ao Auth server):
                    // a sessão recebida pelo listener já foi validada pelo Supabase.
                    const role = (session.user.app_metadata?.role as string) || "user";
                    const userData = await repository.getUserFromSession(session.user.id, role);
                    if (mounted) {
                        console.log(`✅ Usuário atualizado: ${userData?.email}`);
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

        // GARANTIA DEFENSIVA: getSession() chamado imediatamente após registrar listener
        // Neste ponto o listener já está ativo, então não há race condition
        // Se INITIAL_SESSION já processou, initialSessionResolved impede reprocessamento
        (async () => {
            try {
                // Implementação de Promise.race com timeout de 3s para evitar bloqueio infinito
                // caso o Supabase falhe ou apresente lag extremo (cold start) no carregamento frio
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise<any>((_, reject) =>
                    setTimeout(() => reject(new Error('Auth timeout: getSession() não respondeu em 3 segundos')), 3000)
                );

                const {
                    data: { session },
                } = await Promise.race([sessionPromise, timeoutPromise]);

                // Se já foi resolvido pelo INITIAL_SESSION, não reprocessa
                if (!mounted || initialSessionResolved) return;

                console.log("⚠️ INITIAL_SESSION não recebido - sincronizando via getSession()");

                if (session?.user) {
                    const repository = DIContainer.getAuthRepository();
                    const role = (session.user.app_metadata?.role as string) || "user";
                    const userData = await repository.getUserFromSession(session.user.id, role);
                    if (mounted && !initialSessionResolved) {
                        console.log("✅ Sessão restaurada via getSession() defensivo:", userData?.email);
                        setUser(userData);
                        userRef.current = userData;
                        initialSessionResolved = true;
                    }
                } else {
                    if (mounted && !initialSessionResolved) {
                        console.log("ℹ️ Nenhuma sessão encontrada (getSession() defensivo)");
                        setUser(null);
                        userRef.current = null;
                        initialSessionResolved = true;
                    }
                }
            } catch (err) {
                // Timeout no cold start não é erro crítico. Next.js captura console.error
                const isTimeout = err instanceof Error && err.message.includes('Auth timeout');
                if (isTimeout) {
                    console.info("ℹ️ Timeout na autenticação defensiva — assumindo sessão não autenticada no initial load.");
                } else {
                    console.warn("⚠️ Erro no getSession() defensivo:", err);
                }

                if (mounted && !initialSessionResolved) {
                    setUser(null);
                    userRef.current = null;
                    initialSessionResolved = true;
                }
            } finally {
                // SEMPRE resolve isLoading — sem guarda de mounted.
                // Em React 18+, state updates em componentes desmontados são no-ops seguros.
                // Isso garante que isLoading nunca fique preso em `true` no React Strict Mode.
                if (mounted && !initialSessionResolved) {
                    initialSessionResolved = true;
                }
                setIsLoading(false);
            }
        })();

        // Cleanup
        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

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
