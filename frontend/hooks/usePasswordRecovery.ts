/**
 * usePasswordRecovery Hook
 *
 * Hook dedicado para gerenciar o fluxo de recuperação de senha.
 * Este é um estado de UI temporário, não pertence ao contexto global de sessão.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pelo fluxo de password recovery
 * - Separation of Concerns: Estado de UI não vaza para camada de domínio
 * - Clean Code: Nomenclatura clara e fluxo explícito
 *
 * Fluxo:
 * 1. Extrai tokens do hash da URL (implicit flow)
 * 2. Estabelece sessão via setSession()
 * 3. Fallback: escuta PASSWORD_RECOVERY event com timeout
 * 4. Permite reset de senha
 * 5. Cleanup: encerra sessão e limpa URL
 */

"use client";

import { supabase } from "@/infrastructure/config/supabase";
import { useCallback, useEffect, useState } from "react";

type RecoveryStatus = "idle" | "loading" | "ready" | "success" | "error";

interface UsePasswordRecoveryResult {
    recoveryStatus: RecoveryStatus;
    recoveryError: string | null;
    isLoading: boolean;
    resetPassword: (newPassword: string, confirmPassword?: string) => Promise<boolean>;
}

export function usePasswordRecovery(): UsePasswordRecoveryResult {
    const [status, setStatus] = useState<RecoveryStatus>("loading");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout | null = null;
        let subscription: { unsubscribe: () => void } | null = null;

        const establishRecoverySession = async () => {
            try {
                // Tenta extrair tokens do hash da URL (implicit flow do Supabase)
                const hash = window.location.hash;
                const params = new URLSearchParams(hash.substring(1));
                const accessToken = params.get("access_token");
                const refreshToken = params.get("refresh_token");
                const type = params.get("type");

                // Se tokens estão no hash e é tipo recovery, estabelece sessão manualmente
                if (type === "recovery" && accessToken) {
                    console.log("🔑 Tokens encontrados no hash, estabelecendo sessão...");
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken ?? "",
                    });

                    if (error) {
                        console.error("❌ Erro ao estabelecer sessão:", error);
                        if (mounted) {
                            setStatus("error");
                            setErrorMessage("Link expirado. Solicite um novo link de recuperação.");
                        }
                    } else {
                        console.log("✅ Sessão de recovery estabelecida com sucesso");
                        if (mounted) {
                            setStatus("ready");
                        }
                    }

                    // Limpa hash da URL para não vazar tokens
                    window.history.replaceState({}, "", window.location.pathname);
                    return;
                }

                // Fallback: Se hash já foi consumido, escuta o evento PASSWORD_RECOVERY
                console.log("👂 Aguardando evento PASSWORD_RECOVERY...");
                const {
                    data: { subscription: authSubscription },
                } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === "PASSWORD_RECOVERY") {
                        console.log("🔐 PASSWORD_RECOVERY event detectado via listener");
                        if (mounted) {
                            setStatus("ready");
                        }
                    }
                });

                subscription = authSubscription;

                // Timeout de segurança: se em 5s não veio evento, token é inválido
                timeoutId = setTimeout(() => {
                    if (mounted && status === "loading") {
                        console.warn("⏱️ Timeout: PASSWORD_RECOVERY não recebido em 5s");
                        setStatus("error");
                        setErrorMessage("Link inválido ou expirado. Solicite um novo link de recuperação.");
                    }
                }, 5000);
            } catch (err) {
                console.error("❌ Erro ao estabelecer sessão de recovery:", err);
                if (mounted) {
                    setStatus("error");
                    setErrorMessage("Erro ao processar link de recuperação. Tente novamente.");
                }
            }
        };

        establishRecoverySession();

        // Cleanup
        return () => {
            mounted = false;
            if (timeoutId) clearTimeout(timeoutId);
            if (subscription) subscription.unsubscribe();
        };
    }, []); // Roda apenas uma vez na montagem

    const resetPassword = useCallback(
        async (newPassword: string, confirmPassword?: string): Promise<boolean> => {
            // Valida senhas se confirmPassword foi fornecida
            if (confirmPassword !== undefined && newPassword !== confirmPassword) {
                setStatus("error");
                setErrorMessage("As senhas não coincidem");
                return false;
            }

            setStatus("loading");
            setErrorMessage(null);

            try {
                console.log("🔐 Atualizando senha...");
                const { error } = await supabase.auth.updateUser({ password: newPassword });

                if (error) {
                    console.error("❌ Erro ao atualizar senha:", error);
                    setStatus("error");
                    setErrorMessage(error.message || "Erro ao redefinir senha. Tente novamente.");
                    return false;
                } else {
                    console.log("✅ Senha atualizada com sucesso");
                    setStatus("success");

                    // Encerra sessão de recovery após sucesso
                    await supabase.auth.signOut();
                    console.log("👋 Sessão de recovery encerrada");
                    return true;
                }
            } catch (err) {
                console.error("❌ Erro inesperado ao resetar senha:", err);
                setStatus("error");
                setErrorMessage("Erro inesperado. Tente novamente mais tarde.");
                return false;
            }
        },
        [status],
    );

    return {
        recoveryStatus: status,
        recoveryError: errorMessage,
        isLoading: status === "loading",
        resetPassword,
    };
}
