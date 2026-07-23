"use client";

import { User } from "@/domain/entities/User";
import { AuthError } from "@/domain/errors/AuthError";
import type { SignInParams, SignUpParams } from "@/domain/repositories/IAuthRepository";
import DIContainer from "@/infrastructure/di/container";
import { authClient } from "@/lib/auth-client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

/**
 * iOS Safari session-recovery handlers.
 *
 * Ported from the legacy SessionContext (commit 2aad548). Two browser
 * events trigger a manual revalidation against the server:
 *
 *   - `visibilitychange` (tab returns to foreground): mobile Safari throttles
 *     timers in background and may serve a stale view of the session. After
 *     a long background, the cookie can be expired/revoked server-side while
 *     the in-memory hook state still shows a logged-in user.
 *
 *   - `pageshow` with `event.persisted === true` (bfcache restore via Back
 *     button on iOS Safari + Chrome iOS): React state is preserved verbatim
 *     from before the navigation, so a since-expired session shows as logged
 *     in until the next user action.
 *
 * Both handlers call `authClient.getSession()` (single HTTP round-trip to
 * `/api/auth/get-session`) and clear local state if the server says no
 * session but our state still has a user.
 *
 * NOT PORTED from the legacy version:
 *   - The `INITIAL_SESSION` cascade (1s/3s/8s revalidation timers). That
 *     workaround targeted iOS ITP throttling legacy IndexedDB token
 *     read on first load. better-auth uses an HTTP-only cookie checked
 *     server-side via a single fetch, so the cascade solves a problem that
 *     no longer exists.
 *   - The signIn/signOut 8s safety timer that force-resolved `isLoading`.
 *     `authClient.useSession()` exposes `isPending` directly from the fetch
 *     state — there's no event-listener race window to guard against.
 *
 * Verifying on a real iPhone (Safari 17+, iOS 17+):
 *   1. Log in. Switch to another app. Wait > 30 min. Return to the tab. UI
 *      should still show logged-in (or revalidate to logged-out if the
 *      server cookie expired during that window).
 *   2. Log in. Tap a link to an external site. Tap the Back button to
 *      return. UI must reflect server truth, not stale React state.
 *   3. Log in via desktop, expire/revoke the session server-side, then
 *      bring the iOS tab to the foreground. Within ~3s the local user
 *      state must clear.
 *
 * Failure symptom: profile menu visible while server session is dead. If
 * that happens, the handlers below stopped firing — check that the events
 * are still attached (some PWA wrappers swallow them).
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
    const [error, setError] = useState<string | null>(null);
    const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
    const [processedSessionUser, setProcessedSessionUser] = useState<unknown>(null);

    const session = authClient.useSession();
    const sessionData = session.data;
    const isPending = session.isPending;

    const userRef = useRef<User | null>(null);

    useEffect(() => {
        if (!sessionData?.user) {
            setUser(null);
            userRef.current = null;
            setProcessedSessionUser(null);
            return;
        }
        const rawSessionUser = sessionData.user;
        try {
            const u = rawSessionUser as Record<string, unknown>;
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
            userRef.current = mapped;
        } catch {
            setUser(null);
            userRef.current = null;
        } finally {
            setProcessedSessionUser(rawSessionUser);
        }
    }, [sessionData]);

    useEffect(() => {
        const revalidateAgainstServer = async () => {
            if (userRef.current === null) return;
            try {
                const { data } = await authClient.getSession();
                if (!data?.session && userRef.current !== null) {
                    setUser(null);
                    userRef.current = null;
                }
            } catch {
                // Network/offline — keep current state; next event will retry.
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState !== "visible") return;
            void revalidateAgainstServer();
        };

        const handlePageShow = (event: PageTransitionEvent) => {
            if (!event.persisted) return;
            void revalidateAgainstServer();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("pageshow", handlePageShow);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, []);

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

    // isPending sinaliza que o fetch terminou, mas o useEffect que mapeia
    // sessionData → user state ainda não rodou. Manter isLoading=true durante
    // esse gap de um render evita redirecionamentos prematuros no admin.
    const isLoading = isPending || (!!sessionData?.user && processedSessionUser !== sessionData.user);

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

export function useSession(): SessionContextType {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession deve ser usado dentro de um SessionProvider");
    }
    return context;
}
