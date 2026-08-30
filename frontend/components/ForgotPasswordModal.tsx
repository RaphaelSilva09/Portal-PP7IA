"use client";

import { AlertCircle, Check, Eye, EyeOff, Mail, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useForgotPasswordModal } from "../context/ForgotPasswordModalContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useDialogA11y } from "../hooks/useDialogA11y";
import { usePasswordRecovery } from "../hooks/usePasswordRecovery";
import { isValidEmail, isValidPassword } from "../lib/validators";

export default function ForgotPasswordModal() {
    const { isOpen, closeModal } = useForgotPasswordModal();
    const {
        state,
        cooldownRemaining,
        requestReset,
        verifyCode,
        resendCode,
        resetPassword,
        restartRecovery,
    } = usePasswordRecovery();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [emailFormatError, setEmailFormatError] = useState<string | undefined>();
    const [otpFormatError, setOtpFormatError] = useState<string | undefined>();
    const [passwordFormatErrors, setPasswordFormatErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

    const panelRef = useRef<HTMLDivElement>(null);
    const otpFormatErrorId = useId();
    const otpServerErrorId = useId();
    const passwordErrorId = useId();
    const confirmPasswordErrorId = useId();

    useBodyScrollLock(isOpen);

    useEffect(() => {
        if (isOpen) {
            setEmail(state.phase === "code" || state.phase === "password" ? state.email : "");
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setEmailFormatError(undefined);
            setOtpFormatError(undefined);
            setPasswordFormatErrors({});
            setShowPassword(false);
            setShowConfirmPassword(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const validateEmailFormat = () => {
        if (!email.trim()) { setEmailFormatError("Email é obrigatório"); return false; }
        if (!isValidEmail(email)) { setEmailFormatError("Email inválido"); return false; }
        setEmailFormatError(undefined);
        return true;
    };

    const validateOtpFormat = () => {
        if (!otp.trim()) { setOtpFormatError("Código é obrigatório"); return false; }
        if (!/^\d{8}$/.test(otp)) { setOtpFormatError("Código deve ter 8 dígitos"); return false; }
        setOtpFormatError(undefined);
        return true;
    };

    const validatePasswordFormat = () => {
        const e: typeof passwordFormatErrors = {};
        if (!newPassword.trim()) e.newPassword = "Nova senha é obrigatória";
        else if (!isValidPassword(newPassword, 6)) e.newPassword = "Senha deve ter no mínimo 6 caracteres";
        if (!confirmPassword.trim()) e.confirmPassword = "Confirmação é obrigatória";
        else if (newPassword !== confirmPassword) e.confirmPassword = "As senhas não coincidem";
        setPasswordFormatErrors(e);
        return !e.newPassword && !e.confirmPassword;
    };

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateEmailFormat()) await requestReset(email);
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (state.phase === "code" && state.locked) return;
        if (validateOtpFormat()) await verifyCode(otp);
    };

    const handleResendCode = async () => {
        if (cooldownRemaining > 0) return;
        setOtp("");
        setOtpFormatError(undefined);
        await resendCode();
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validatePasswordFormat()) await resetPassword(newPassword, confirmPassword);
    };

    const handleClose = () => {
        const isBusy =
            (state.phase === "email" && state.isSubmitting) ||
            (state.phase === "code" && (state.isSubmitting || state.isResending)) ||
            (state.phase === "password" && state.isSubmitting);
        if (isBusy) return;
        closeModal();
        // Garante que reabrir o modal comece limpo — sem sucesso/erro de uma sessão anterior.
        restartRecovery();
    };

    useDialogA11y(isOpen, handleClose, panelRef);

    useEffect(() => {
        if (state.phase === "success") {
            // Passa por handleClose (não closeModal direto) para que restartRecovery também
            // rode aqui — senão reabrir o modal mostraria a tela de sucesso de novo.
            const timer = setTimeout(() => handleClose(), 2000);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.phase]);

    const steps = ["Email", "Código", "Nova senha"];
    const stepIndex = state.phase === "email" ? 0 : state.phase === "code" ? 1 : 2;

    const titles: Record<typeof state.phase, string> = {
        email: "Recuperar senha.",
        code: "Verificar código.",
        password: "Nova senha.",
        success: "Tudo certo!",
    };
    const subtitles: Record<typeof state.phase, string> = {
        email: "Insira seu email para receber um código de recuperação.",
        code: "Se houver uma conta vinculada a este email, enviamos um código de 8 dígitos para ele.",
        password: "Crie uma nova senha para sua conta.",
        success: "Senha redefinida com sucesso. Entre novamente usando sua nova senha.",
    };

    const inputClass = (hasError: boolean) =>
        `w-full rounded-xl border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground bg-background outline-none transition focus:ring-2 focus:ring-primary/20 ${
            hasError ? "border-red-400" : "border-border focus:border-primary/40"
        }`;

    if (!isOpen) return null;

    const isCodeBusy = state.phase === "code" && (state.isSubmitting || state.isResending);
    const isPasswordBusy = state.phase === "password" && state.isSubmitting;
    const isEmailBusy = state.phase === "email" && state.isSubmitting;

    return (
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />

                <div
                    ref={panelRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="forgot-password-title"
                    className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-elevated)]"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 pb-4">
                        <div className="flex-1">
                            {/* Step indicator */}
                            {state.phase !== "success" && (
                                <div className="mb-3 flex items-center gap-2">
                                    {steps.map((step, i) => (
                                        <div key={step} className="flex items-center gap-2">
                                            <div className={`flex size-5 items-center justify-center rounded-full text-[10px] font-medium transition-colors ${
                                                i < stepIndex
                                                    ? "bg-ink text-background"
                                                    : i === stepIndex
                                                    ? "border-2 border-ink text-ink"
                                                    : "border border-border text-muted-foreground"
                                            }`}>
                                                {i < stepIndex ? <Check className="size-3" /> : i + 1}
                                            </div>
                                            <span className={`text-[10px] uppercase tracking-wide ${i === stepIndex ? "text-foreground" : "text-muted-foreground"}`}>
                                                {step}
                                            </span>
                                            {i < steps.length - 1 && (
                                                <div className={`h-px w-6 ${i < stepIndex ? "bg-ink" : "bg-border"}`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <h2 id="forgot-password-title" className="font-serif text-2xl text-ink">{titles[state.phase]}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{subtitles[state.phase]}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isEmailBusy || isCodeBusy || isPasswordBusy}
                            className="ml-4 mt-1 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                            aria-label="Fechar modal"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    <div className="px-6 pb-6">
                        {/* Step 1: Email */}
                        {state.phase === "email" && (
                            <form onSubmit={handleRequestCode} className="space-y-4">
                                {state.error && (
                                    <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/20">
                                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                                        <p className="text-xs text-red-700 dark:text-red-400">{state.error}</p>
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <label htmlFor="forgot-password-email" className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            id="forgot-password-email"
                                            type="email"
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); if (emailFormatError) setEmailFormatError(undefined); }}
                                            placeholder="seu@email.com"
                                            className={`${inputClass(!!emailFormatError)} pl-10`}
                                            disabled={isEmailBusy}
                                            aria-invalid={!!emailFormatError}
                                            aria-describedby={emailFormatError ? "forgot-password-email-error" : undefined}
                                            autoComplete="email"
                                            autoFocus
                                        />
                                    </div>
                                    {emailFormatError && <p id="forgot-password-email-error" className="text-xs text-red-500">{emailFormatError}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isEmailBusy}
                                    className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {isEmailBusy ? (
                                        <span className="inline-flex items-center gap-2">
                                            <span className="size-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                                            Enviando…
                                        </span>
                                    ) : (
                                        "Enviar código"
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Step 2: OTP */}
                        {state.phase === "code" && (
                            <form onSubmit={handleVerifyCode} className="space-y-4">
                                {state.error && (
                                    <div
                                        role="alert"
                                        id={otpServerErrorId}
                                        className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/20"
                                    >
                                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                                        <p className="text-xs text-red-700 dark:text-red-400">{state.error.message}</p>
                                    </div>
                                )}
                                {!state.error && state.resendNotice && (
                                    <div role="status" className="flex items-start gap-2 rounded-xl border border-border bg-accent/60 p-3">
                                        <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">{state.resendNotice}</p>
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <label htmlFor="forgot-password-otp" className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                        Código de verificação
                                    </label>
                                    <input
                                        id="forgot-password-otp"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={8}
                                        pattern="[0-9]{8}"
                                        value={otp}
                                        onChange={e => { const v = e.target.value.replace(/\D/g, ""); setOtp(v); if (otpFormatError) setOtpFormatError(undefined); }}
                                        placeholder="00000000"
                                        className={`${inputClass(!!otpFormatError || !!state.error)} text-center font-mono text-2xl tracking-[0.5em]`}
                                        disabled={isCodeBusy || state.locked}
                                        aria-invalid={!!otpFormatError || !!state.error}
                                        aria-describedby={[otpFormatError && otpFormatErrorId, state.error && otpServerErrorId].filter(Boolean).join(" ") || undefined}
                                        autoComplete="one-time-code"
                                        autoFocus
                                    />
                                    {otpFormatError && <p id={otpFormatErrorId} className="text-xs text-red-500">{otpFormatError}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isCodeBusy || state.locked}
                                    className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {state.isSubmitting ? (
                                        <span className="inline-flex items-center gap-2">
                                            <span className="size-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                                            Verificando…
                                        </span>
                                    ) : (
                                        "Verificar código"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={cooldownRemaining > 0 || state.isResending}
                                    className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {state.isResending
                                        ? "Reenviando…"
                                        : cooldownRemaining > 0
                                        ? `Reenviar em ${cooldownRemaining}s`
                                        : "Reenviar código"}
                                </button>
                            </form>
                        )}

                        {/* Step 3: Nova senha */}
                        {state.phase === "password" && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                {state.error && (
                                    <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/20">
                                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                                        <p className="text-xs text-red-700 dark:text-red-400">{state.error.message}</p>
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <label htmlFor="forgot-password-new" className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                        Nova senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="forgot-password-new"
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={e => { setNewPassword(e.target.value); if (passwordFormatErrors.newPassword) setPasswordFormatErrors(p => ({ ...p, newPassword: undefined })); }}
                                            placeholder="Mínimo 6 caracteres"
                                            className={`${inputClass(!!passwordFormatErrors.newPassword)} pr-10`}
                                            disabled={isPasswordBusy}
                                            aria-invalid={!!passwordFormatErrors.newPassword}
                                            aria-describedby={passwordFormatErrors.newPassword ? passwordErrorId : undefined}
                                            autoComplete="new-password"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </button>
                                    </div>
                                    {passwordFormatErrors.newPassword && <p id={passwordErrorId} className="text-xs text-red-500">{passwordFormatErrors.newPassword}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="forgot-password-confirm" className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                        Confirmar nova senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="forgot-password-confirm"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={e => { setConfirmPassword(e.target.value); if (passwordFormatErrors.confirmPassword) setPasswordFormatErrors(p => ({ ...p, confirmPassword: undefined })); }}
                                            placeholder="Repita a senha"
                                            className={`${inputClass(!!passwordFormatErrors.confirmPassword)} pr-10`}
                                            disabled={isPasswordBusy}
                                            aria-invalid={!!passwordFormatErrors.confirmPassword}
                                            aria-describedby={passwordFormatErrors.confirmPassword ? confirmPasswordErrorId : undefined}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </button>
                                    </div>
                                    {passwordFormatErrors.confirmPassword && <p id={confirmPasswordErrorId} className="text-xs text-red-500">{passwordFormatErrors.confirmPassword}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPasswordBusy}
                                    className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {isPasswordBusy ? (
                                        <span className="inline-flex items-center gap-2">
                                            <span className="size-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                                            Redefinindo…
                                        </span>
                                    ) : (
                                        "Redefinir senha"
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Step 4: Sucesso */}
                        {state.phase === "success" && (
                            <div className="flex flex-col items-center gap-4 py-6 text-center">
                                <div className="flex size-14 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20">
                                    <Check className="size-7 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Você já pode fazer login com sua nova senha.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
    );
}
