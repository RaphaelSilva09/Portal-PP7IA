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

const authDebugStart = Date.now();

const authDebug = (...args: unknown[]) => {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG !== 'true') return;
    console.log('[Auth]', `+${Date.now() - authDebugStart}ms`, ...args);
};

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
        const initialSessionRevalidationTimers: ReturnType<typeof setTimeout>[] = [];

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            authDebug('event', event, {
                hasSession: !!session,
                userId: session?.user?.id?.slice(0, 8) ?? null,
                identitiesCount: Array.isArray(session?.user?.identities)
                    ? session.user.identities.length
                    : 'undefined',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'ssr',
            });

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
                            setUser(userData);
                            userRef.current = userData;
                            authDebug('getUserFromSession result', {
                                event,
                                found: !!userData,
                                userId: session?.user?.id?.slice(0, 8) ?? null,
                            });
                        }
                    } catch (err) {
                        authDebug('getUserFromSession error', { event, err });
                        if (mounted) {
                            setUser(null);
                            userRef.current = null;
                        }
                    }
                } else {
                    setUser(null);
                    userRef.current = null;
                    // Safari/iOS ITP: INITIAL_SESSION pode chegar sem sessão mesmo com usuário logado.
                    // Cascata de revalidação em 1s, 3s, 8s — cobre desde delays curtos (5s) até
                    // os casos extremos de 63s. Cada timer é no-op se SIGNED_IN ou outro timer
                    // já setou o usuário (guard userRef.current !== null).
                    const revalidate = async (delay: number) => {
                        if (!mounted || userRef.current !== null) return;
                        const { data: { session: revalidatedSession } } = await supabase.auth.getSession();
                        if (!mounted || userRef.current !== null || !revalidatedSession?.user) return;
                        try {
                            const repository = DIContainer.getAuthRepository();
                            const role = (revalidatedSession.user.app_metadata?.role as string) || "user";
                            const userData = await repository.getUserFromSession(revalidatedSession.user.id, role);
                            if (mounted && userRef.current === null) {
                                setUser(userData);
                                userRef.current = userData;
                                authDebug('INITIAL_SESSION revalidation', { found: !!userData, delay: `${delay}ms` });
                            }
                        } catch {
                            // Falha silenciosa — o Supabase vai disparar SIGNED_IN quando estiver pronto
                        }
                    };
                    for (const delay of [1000, 3000, 8000]) {
                        initialSessionRevalidationTimers.push(setTimeout(() => revalidate(delay), delay));
                    }
                }
                if (mounted) setIsLoading(false);
                return;
            }

            // PASSWORD_RECOVERY é tratado pelo hook dedicado usePasswordRecovery
            if (event === "PASSWORD_RECOVERY") {
                return;
            }

            if (event === "SIGNED_OUT") {
                setUser(null);
                userRef.current = null;
                setEmailConfirmationRequired(false);
                setIsLoading(false);
                return;
            }

            // Ignora SIGNED_IN se o userId é o mesmo (evita re-fetch desnecessário)
            if (event === "SIGNED_IN" && session?.user?.id === userRef.current?.id) {
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
                        setUser(userData);
                        userRef.current = userData;
                        authDebug('getUserFromSession result', {
                            event,
                            found: !!userData,
                            userId: session?.user?.id?.slice(0, 8) ?? null,
                        });
                    }
                } catch (err) {
                    authDebug('getUserFromSession error', { event, err });
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
                // Await direto — a proteção de timeout está no fetch (10s via createFetchWithTimeout)
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                // Se já foi resolvido pelo INITIAL_SESSION, não reprocessa
                if (!mounted || initialSessionResolved) return;

                if (session?.user) {
                    const repository = DIContainer.getAuthRepository();
                    const role = (session.user.app_metadata?.role as string) || "user";
                    const userData = await repository.getUserFromSession(session.user.id, role);
                    if (mounted && !initialSessionResolved) {
                        setUser(userData);
                        userRef.current = userData;
                        initialSessionResolved = true;
                    }
                } else {
                    if (mounted && !initialSessionResolved) {
                        setUser(null);
                        userRef.current = null;
                        initialSessionResolved = true;
                    }
                }
            } catch (err) {
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

        // Re-verifica sessão ao retornar à aba após inatividade (browser throttle)
        const handleVisibilityChange = async () => {
            if (document.visibilityState !== 'visible') return;
            await supabase.auth.getSession();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Restauração via bfcache (Safari/Chrome iOS — botão Voltar)
        // e.persisted === true indica que a página foi restaurada do cache, não recarregada
        // O onAuthStateChange não é redispachado nesse caso, então forçamos uma verificação
        const handlePageShow = (e: PageTransitionEvent) => {
            if (e.persisted) {
                supabase.auth.getSession();
            }
        };
        window.addEventListener('pageshow', handlePageShow);

        // Cleanup
        return () => {
            mounted = false;
            initialSessionRevalidationTimers.forEach(clearTimeout);
            subscription.unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pageshow', handlePageShow);
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

        // Safety net: garante que loading nunca fica preso se o onAuthStateChange
        // atrasar ou não disparar (Safari/ITP, falhas silenciosas de browser)
        const safetyTimer = setTimeout(() => setIsLoading(false), 8000);

        try {
            const useCase = DIContainer.getSignInUseCase();
            await useCase.execute(params);
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao fazer login.";
            setError(errorMessage);
            throw err;
        } finally {
            clearTimeout(safetyTimer);
            setIsLoading(false);
        }
    }, []);

    /**
     * Realiza logout do usuário
     */
    const signOut = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        const safetyTimer = setTimeout(() => setIsLoading(false), 8000);

        try {
            const useCase = DIContainer.getSignOutUseCase();
            await useCase.execute();
        } catch (err) {
            const errorMessage = err instanceof AuthError ? err.message : "Erro ao fazer logout.";
            setError(errorMessage);
            throw err;
        } finally {
            clearTimeout(safetyTimer);
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
