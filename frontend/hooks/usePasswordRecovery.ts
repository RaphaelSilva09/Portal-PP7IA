/**
 * usePasswordRecovery Hook (OTP-based)
 *
 * Hook dedicado para gerenciar o fluxo de recuperação de senha via código OTP de 8 dígitos.
 * Este é um estado de UI temporário, não pertence ao contexto global de sessão.
 *
 * O fluxo é modelado como uma máquina de estados discriminada por `phase`
 * (email -> code -> password -> success). Cada fase carrega apenas os dados/erros que
 * fazem sentido para ela, então um erro de código não pode sobreviver à transição para a
 * fase de senha, e um estado de sucesso nunca carrega um erro pendente — esses estados são
 * irrepresentáveis no tipo, não apenas evitados por convenção.
 *
 * Fluxo OTP:
 * 1. requestReset: Envia email com código OTP de 8 dígitos
 * 2. verifyCode: Valida OTP (não consome — checkVerificationOtp) e avança para PASSWORD
 * 3. resetPassword: Redime o OTP e atualiza a senha (resetPasswordWithOTP)
 * 4. Cleanup: Encerra sessão
 */

"use client";

import DIContainer from "@/infrastructure/di/container";
import {
    InvalidOTPError,
    OTPExpiredError,
    RateLimitError,
    TooManyOTPAttemptsError,
    WeakPasswordError,
} from "@/domain/errors/AuthError";
import { useCallback, useEffect, useRef, useState } from "react";

/** Mirrors `allowedAttempts` configured on the emailOTP plugin in lib/auth.ts. UI-only —
 *  the real limit is enforced server-side per email+type in the `verification` table, so a
 *  page refresh resetting this mirror cannot grant extra real attempts. */
const MAX_OTP_ATTEMPTS = 10;
const COOLDOWN_SECONDS = 60;

export type CodeErrorKind = "invalid" | "expired" | "too_many_attempts" | "rate_limited" | "unknown";
export type PasswordErrorKind = "weak" | "mismatch" | "session_expired" | "rate_limited" | "unknown";

export interface CodeError {
    kind: CodeErrorKind;
    message: string;
    attemptsRemaining: number | null;
}

export interface PasswordError {
    kind: PasswordErrorKind;
    message: string;
}

export type RecoveryState =
    | { phase: "email"; isSubmitting: boolean; error: string | null }
    | {
          phase: "code";
          email: string;
          isSubmitting: boolean;
          isResending: boolean;
          error: CodeError | null;
          resendNotice: string | null;
          locked: boolean; // attempts exhausted — only resend can unblock
      }
    | { phase: "password"; email: string; isSubmitting: boolean; error: PasswordError | null }
    | { phase: "success" };

interface UsePasswordRecoveryResult {
    state: RecoveryState;
    cooldownRemaining: number;

    requestReset: (email: string) => Promise<boolean>;
    verifyCode: (code: string) => Promise<boolean>;
    resendCode: () => Promise<boolean>;
    resetPassword: (newPassword: string, confirmPassword?: string) => Promise<boolean>;
    restartRecovery: () => void;
}

function pluralAttempts(remaining: number): string {
    return remaining === 1 ? "Resta 1 tentativa" : `Restam ${remaining} tentativas`;
}

function buildInvalidCodeError(remaining: number): CodeError {
    if (remaining <= 0) {
        return {
            kind: "too_many_attempts",
            message: "Limite de tentativas atingido. Por segurança, este código não pode mais ser usado. Solicite um novo código para continuar.",
            attemptsRemaining: 0,
        };
    }
    if (remaining === 1) {
        return {
            kind: "invalid",
            message: `Código incorreto. ${pluralAttempts(remaining)}. Depois disso, este código não poderá mais ser usado.`,
            attemptsRemaining: remaining,
        };
    }
    if (remaining === 2) {
        return {
            kind: "invalid",
            message: `Código incorreto. ${pluralAttempts(remaining)}. Depois disso, você precisará solicitar um novo código.`,
            attemptsRemaining: remaining,
        };
    }
    return {
        kind: "invalid",
        message: `Código incorreto. Confira os 8 dígitos enviados por e-mail e tente novamente. ${pluralAttempts(remaining)}.`,
        attemptsRemaining: remaining,
    };
}

function buildRateLimitMessage(retryAfterSeconds: number | null): string {
    return retryAfterSeconds
        ? `Muitas tentativas em pouco tempo. Aguarde ${retryAfterSeconds}s e tente novamente.`
        : "Muitas tentativas em pouco tempo. Aguarde e tente novamente.";
}

/** Interprets a caught error in the context of the CODE step. Increments the local attempts
 *  mirror on a wrong guess — cosmetic only; the server enforces the real limit regardless of
 *  what this mirror shows after a refresh. */
function toCodeError(err: unknown, failedAttemptsRef: { current: number }): CodeError {
    if (err instanceof InvalidOTPError) {
        failedAttemptsRef.current = Math.min(MAX_OTP_ATTEMPTS, failedAttemptsRef.current + 1);
        return buildInvalidCodeError(MAX_OTP_ATTEMPTS - failedAttemptsRef.current);
    }
    if (err instanceof TooManyOTPAttemptsError) {
        failedAttemptsRef.current = MAX_OTP_ATTEMPTS;
        return {
            kind: "too_many_attempts",
            message: "Limite de tentativas atingido. Por segurança, este código não pode mais ser usado. Solicite um novo código para continuar.",
            attemptsRemaining: 0,
        };
    }
    if (err instanceof OTPExpiredError) {
        return {
            kind: "expired",
            message: "Este código expirou. Solicite um novo código para continuar.",
            attemptsRemaining: null,
        };
    }
    if (err instanceof RateLimitError) {
        return { kind: "rate_limited", message: buildRateLimitMessage(err.retryAfterSeconds), attemptsRemaining: null };
    }
    return {
        kind: "unknown",
        message: err instanceof Error ? err.message : "Não foi possível verificar o código. Tente novamente.",
        attemptsRemaining: null,
    };
}

/** Interprets a caught error in the context of the PASSWORD step. OTP-shaped errors here mean
 *  the recovery challenge itself died between verification and submission (expired, exhausted,
 *  or otherwise no longer redeemable) — never reported as "código incorreto" (that belongs to
 *  the CODE step) and never as success. */
function toPasswordError(err: unknown): PasswordError {
    if (err instanceof WeakPasswordError) {
        return { kind: "weak", message: err.message };
    }
    if (err instanceof OTPExpiredError || err instanceof TooManyOTPAttemptsError || err instanceof InvalidOTPError) {
        return {
            kind: "session_expired",
            message: "Sua sessão de redefinição expirou. Solicite um novo código para continuar.",
        };
    }
    if (err instanceof RateLimitError) {
        return { kind: "rate_limited", message: buildRateLimitMessage(err.retryAfterSeconds) };
    }
    return {
        kind: "unknown",
        message: "Não foi possível concluir a alteração da senha. Tente novamente.",
    };
}

export function usePasswordRecovery(): UsePasswordRecoveryResult {
    const [state, setState] = useState<RecoveryState>({ phase: "email", isSubmitting: false, error: null });
    const [cooldown, setCooldown] = useState(0);
    const failedAttemptsRef = useRef(0);
    // Synchronous re-entrancy guard. `state.isSubmitting` is only visible after a render
    // commits, so two synchronous calls fired back-to-back (double-click, double-invoke
    // without awaiting) both read the same stale `false` and both pass the state-based check.
    // A ref mutates immediately, so the second call sees `true` before it does anything.
    const busyRef = useRef(false);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const requestReset = useCallback(async (emailAddress: string): Promise<boolean> => {
        if (state.phase !== "email" || state.isSubmitting || busyRef.current) return false;
        busyRef.current = true;
        setState(s => (s.phase === "email" ? { ...s, isSubmitting: true, error: null } : s));

        try {
            const useCase = DIContainer.getSendPasswordResetUseCase();
            await useCase.execute({ email: emailAddress });

            failedAttemptsRef.current = 0;
            setCooldown(COOLDOWN_SECONDS);
            setState({
                phase: "code",
                email: emailAddress,
                isSubmitting: false,
                isResending: false,
                error: null,
                resendNotice: null,
                locked: false,
            });
            return true;
        } catch (err) {
            setState({
                phase: "email",
                isSubmitting: false,
                error: err instanceof Error ? err.message : "Erro ao enviar código.",
            });
            return false;
        } finally {
            busyRef.current = false;
        }
    }, [state]);

    const verifyCode = useCallback(
        async (code: string): Promise<boolean> => {
            if (state.phase !== "code" || state.isSubmitting || state.isResending || state.locked || busyRef.current) {
                return false;
            }
            busyRef.current = true;
            const { email } = state;

            setState(s => (s.phase === "code" ? { ...s, isSubmitting: true, error: null } : s));

            try {
                const useCase = DIContainer.getVerifyPasswordResetOTPUseCase();
                await useCase.execute({ email, otp: code });

                failedAttemptsRef.current = 0;
                setState({ phase: "password", email, isSubmitting: false, error: null });
                return true;
            } catch (err) {
                const codeError = toCodeError(err, failedAttemptsRef);
                setState(s =>
                    s.phase === "code"
                        ? { ...s, isSubmitting: false, error: codeError, locked: codeError.kind === "too_many_attempts" }
                        : s,
                );
                return false;
            } finally {
                busyRef.current = false;
            }
        },
        [state],
    );

    const resendCode = useCallback(async (): Promise<boolean> => {
        if (state.phase !== "code" || state.isResending || state.isSubmitting || busyRef.current) return false;
        if (cooldown > 0) return false;
        busyRef.current = true;
        const { email, locked: wasLocked } = state;

        setState(s => (s.phase === "code" ? { ...s, isResending: true, error: null, resendNotice: null } : s));

        try {
            const useCase = DIContainer.getSendPasswordResetUseCase();
            await useCase.execute({ email });

            // Server keeps the same OTP + accumulated attempts alive across a resend
            // (resendStrategy: "reuse"), so the local mirror is intentionally NOT reset here —
            // resending must not look like a fresh 10-attempt budget while the underlying
            // challenge is unchanged. The one exception: if the previous challenge was already
            // exhausted (TOO_MANY_ATTEMPTS deleted it server-side), this resend necessarily
            // started a brand-new challenge with a real 0-attempt count.
            if (wasLocked) failedAttemptsRef.current = 0;

            setCooldown(COOLDOWN_SECONDS);
            setState(s =>
                s.phase === "code"
                    ? {
                          ...s,
                          isResending: false,
                          error: null,
                          resendNotice: "Reenviamos o código para o seu email. Use o código mais recente recebido.",
                          locked: false,
                      }
                    : s,
            );
            return true;
        } catch (err) {
            // better-auth's send-verification-otp endpoint doesn't throw TOO_MANY_ATTEMPTS today
            // (only checkVerificationOtp/resetPassword do), but locking here too if it ever did
            // keeps this branch correct without depending on that provider detail staying true.
            const codeError = toCodeError(err, failedAttemptsRef);
            setState(s =>
                s.phase === "code"
                    // A failed resend doesn't change whether the underlying challenge was
                    // already locked — only escalate to locked, never silently unlock it here.
                    ? { ...s, isResending: false, error: codeError, locked: s.locked || codeError.kind === "too_many_attempts" }
                    : s,
            );
            return false;
        } finally {
            busyRef.current = false;
        }
    }, [state, cooldown]);

    const resetPassword = useCallback(
        async (newPassword: string, confirmPassword?: string): Promise<boolean> => {
            if (state.phase !== "password" || state.isSubmitting || busyRef.current) return false;
            busyRef.current = true;

            try {
                if (confirmPassword !== undefined && newPassword !== confirmPassword) {
                    setState(s =>
                        s.phase === "password"
                            ? { ...s, error: { kind: "mismatch", message: "As senhas não coincidem" } }
                            : s,
                    );
                    return false;
                }

                setState(s => (s.phase === "password" ? { ...s, isSubmitting: true, error: null } : s));

                const repository = DIContainer.getAuthRepository();
                try {
                    await repository.resetPasswordWithOTP(newPassword);
                } catch (err) {
                    const passwordError = toPasswordError(err);

                    if (passwordError.kind === "session_expired") {
                        // O challenge de recovery morreu no servidor — não faz sentido manter o
                        // usuário em um formulário que nunca vai conseguir submeter com sucesso.
                        setState({ phase: "email", isSubmitting: false, error: passwordError.message });
                    } else {
                        setState(s => (s.phase === "password" ? { ...s, isSubmitting: false, error: passwordError } : s));
                    }
                    return false;
                }

                // Só entra em SUCCESS depois da confirmação real do backend. A partir daqui a
                // troca de senha já é um fato consumado — uma falha ao encerrar a sessão é um
                // problema de limpeza, não motivo para desdizer o sucesso já confirmado.
                setState({ phase: "success" });
                try {
                    await repository.signOut();
                } catch {
                    // best-effort cleanup — a sessão expira sozinha; nada a reportar ao usuário aqui.
                }
                return true;
            } finally {
                busyRef.current = false;
            }
        },
        [state],
    );

    const restartRecovery = useCallback(() => {
        failedAttemptsRef.current = 0;
        busyRef.current = false;
        setCooldown(0);
        setState({ phase: "email", isSubmitting: false, error: null });
    }, []);

    return {
        state,
        cooldownRemaining: cooldown,
        requestReset,
        verifyCode,
        resendCode,
        resetPassword,
        restartRecovery,
    };
}
