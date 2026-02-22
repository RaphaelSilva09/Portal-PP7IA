/**
 * usePasswordRecovery Hook (OTP-based)
 *
 * Hook dedicado para gerenciar o fluxo de recuperação de senha via código OTP de 8 dígitos.
 * Este é um estado de UI temporário, não pertence ao contexto global de sessão.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pelo fluxo de password recovery OTP
 * - Separation of Concerns: Estado de UI não vaza para camada de domínio
 * - Clean Code: Nomenclatura clara e fluxo explícito
 *
 * Fluxo OTP (novo):
 * 1. requestReset: Envia email com código OTP de 8 dígitos
 * 2. verifyCode: Valida OTP e estabelece sessão temporária
 * 3. resetPassword: Atualiza senha com sessão ativa
 * 4. Cleanup: Encerra sessão e limpa localStorage
 */

"use client";

import DIContainer from "@/infrastructure/di/container";
import { useCallback, useEffect, useState } from "react";

type RecoveryStatus =
    | "idle" // Estado inicial
    | "awaiting_code" // Email enviado, aguardando usuário digitar OTP
    | "verifying" // Validando código OTP
    | "ready" // OTP válido, pode resetar senha
    | "success" // Senha alterada com sucesso
    | "error"; // Erro em qualquer etapa

interface UsePasswordRecoveryResult {
    recoveryStatus: RecoveryStatus;
    recoveryError: string | null;
    userEmail: string | null;
    isLoading: boolean;
    cooldownRemaining: number; // Segundos até permitir re-envio

    requestReset: (email: string) => Promise<boolean>;
    verifyCode: (code: string) => Promise<boolean>;
    resendCode: () => Promise<boolean>;
    resetPassword: (newPassword: string, confirmPassword?: string) => Promise<boolean>;
}

const COOLDOWN_SECONDS = 60; // 60s entre envios
const RECOVERY_EMAIL_KEY = "recovery_email";

export function usePasswordRecovery(): UsePasswordRecoveryResult {
    const [status, setStatus] = useState<RecoveryStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    // Persiste email entre etapas (localStorage + state fallback)
    const [email, setEmail] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(RECOVERY_EMAIL_KEY);
        }
        return null;
    });

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    // Salva email no localStorage sempre que mudar
    useEffect(() => {
        if (email && typeof window !== "undefined") {
            localStorage.setItem(RECOVERY_EMAIL_KEY, email);
        }
    }, [email]);

    /**
     * Step 1: Solicita código OTP via email
     */
    const requestReset = useCallback(async (emailAddress: string): Promise<boolean> => {
        setStatus("awaiting_code");
        setErrorMessage(null);

        try {
            console.log("📧 Solicitando código OTP para:", emailAddress);
            const useCase = DIContainer.getSendPasswordResetUseCase();
            await useCase.execute({ email: emailAddress });

            setEmail(emailAddress);
            setCooldown(COOLDOWN_SECONDS);
            console.log("✅ Código OTP enviado com sucesso");
            return true;
        } catch (err) {
            console.error("❌ Erro ao solicitar OTP:", err);
            setStatus("error");
            setErrorMessage(err instanceof Error ? err.message : "Erro ao enviar código.");
            return false;
        }
    }, []);

    /**
     * Step 2: Verifica código OTP de 8 dígitos
     */
    const verifyCode = useCallback(
        async (code: string): Promise<boolean> => {
            if (!email) {
                setErrorMessage("Email não encontrado. Reinicie o processo.");
                setStatus("error");
                return false;
            }

            setStatus("verifying");
            setErrorMessage(null);

            try {
                console.log("🔐 Verificando código OTP:", code);
                const useCase = DIContainer.getVerifyPasswordResetOTPUseCase();
                await useCase.execute({ email, otp: code });

                setStatus("ready");
                console.log("✅ Código OTP válido - sessão estabelecida");
                return true;
            } catch (err) {
                console.error("❌ Erro ao verificar OTP:", err);
                setStatus("error");
                setErrorMessage(err instanceof Error ? err.message : "Código inválido ou expirado.");
                return false;
            }
        },
        [email],
    );

    /**
     * Re-envia código OTP (com cooldown)
     */
    const resendCode = useCallback(async (): Promise<boolean> => {
        if (!email) {
            setErrorMessage("Email não encontrado. Reinicie o processo.");
            return false;
        }

        if (cooldown > 0) {
            setErrorMessage(`Aguarde ${cooldown}s antes de solicitar novo código.`);
            return false;
        }

        return requestReset(email);
    }, [email, cooldown, requestReset]);

    /**
     * Step 3: Redefine senha após OTP validado
     */
    const resetPassword = useCallback(async (newPassword: string, confirmPassword?: string): Promise<boolean> => {
        // Valida senhas se confirmPassword foi fornecida
        if (confirmPassword !== undefined && newPassword !== confirmPassword) {
            setStatus("error");
            setErrorMessage("As senhas não coincidem");
            return false;
        }

        setStatus("verifying"); // Reutiliza estado de loading
        setErrorMessage(null);

        try {
            console.log("🔐 Atualizando senha...");
            const repository = DIContainer.getAuthRepository();
            await repository.resetPasswordWithOTP(newPassword);

            setStatus("success");
            console.log("✅ Senha atualizada com sucesso");

            // Cleanup: remove email do localStorage e encerra sessão
            if (typeof window !== "undefined") {
                localStorage.removeItem(RECOVERY_EMAIL_KEY);
            }
            await repository.signOut();
            console.log("👋 Sessão de recovery encerrada");

            return true;
        } catch (err) {
            console.error("❌ Erro ao resetar senha:", err);
            setStatus("error");
            setErrorMessage(err instanceof Error ? err.message : "Erro ao redefinir senha.");
            return false;
        }
    }, []);

    return {
        recoveryStatus: status,
        recoveryError: errorMessage,
        userEmail: email,
        isLoading: status === "verifying",
        cooldownRemaining: cooldown,
        requestReset,
        verifyCode,
        resendCode,
        resetPassword,
    };
}
