"use client";

import { AlertCircle, Check, Eye, EyeOff, Mail, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForgotPasswordModal } from "../context/ForgotPasswordModalContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useDialogA11y } from "../hooks/useDialogA11y";
import { usePasswordRecovery } from "../hooks/usePasswordRecovery";
import { isValidEmail, isValidPassword } from "../lib/validators";
import Portal from "./Portal";

export default function ForgotPasswordModal() {
    const { isOpen, closeModal } = useForgotPasswordModal();
    const {
        recoveryStatus,
        recoveryError,
        userEmail,
        isLoading,
        cooldownRemaining,
        requestReset,
        verifyCode,
        resendCode,
        resetPassword,
    } = usePasswordRecovery();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        otp?: string;
        newPassword?: string;
        confirmPassword?: string;
    }>({});

    const panelRef = useRef<HTMLDivElement>(null);

    useBodyScrollLock(isOpen);

    useEffect(() => {
        if (isOpen) {
            setEmail(userEmail || "");
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setErrors({});
            setShowPassword(false);
            setShowConfirmPassword(false);
        }
    }, [isOpen, userEmail]);

    useEffect(() => {
        if (recoveryStatus === "success") {
            const timer = setTimeout(() => closeModal(), 2000);
            return () => clearTimeout(timer);
        }
    }, [recoveryStatus, closeModal]);

    const validateEmail = () => {
        const e: typeof errors = {};
        if (!email.trim()) e.email = "Email é obrigatório";
        else if (!isValidEmail(email)) e.email = "Email inválido";
        setErrors(e);
        return !e.email;
    };

    const validateOTP = () => {
        const e: typeof errors = {};
        if (!otp.trim()) e.otp = "Código é obrigatório";
        else if (!/^\d{8}$/.test(otp)) e.otp = "Código deve ter 8 dígitos";
        setErrors(e);
        return !e.otp;
    };

    const validatePassword = () => {
        const e: typeof errors = {};
        if (!newPassword.trim()) e.newPassword = "Nova senha é obrigatória";
        else if (!isValidPassword(newPassword, 6)) e.newPassword = "Senha deve ter no mínimo 6 caracteres";
        if (!confirmPassword.trim()) e.confirmPassword = "Confirmação é obrigatória";
        else if (newPassword !== confirmPassword) e.confirmPassword = "As senhas não coincidem";
        setErrors(e);
        return !e.newPassword && !e.confirmPassword;
    };

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateEmail()) await requestReset(email);
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateOTP()) await verifyCode(otp);
    };

    const handleResendCode = async () => {
        if (cooldownRemaining > 0) return;
        setOtp("");
        setErrors({});
        await resendCode();
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validatePassword()) await resetPassword(newPassword);
    };

    const handleClose = () => { if (!isLoading) closeModal(); };

    useDialogA11y(isOpen, handleClose, panelRef);

    const steps = ["Email", "Código", "Nova senha"];
    const stepIndex = recoveryStatus === "idle" ? 0
        : recoveryStatus === "awaiting_code" || recoveryStatus === "verifying" ? 1
        : recoveryStatus === "ready" ? 2
        : 2;

    const titles = ["Recuperar senha.", "Verificar código.", "Nova senha.", "Tudo certo!"];
    const subtitles = [
        "Insira seu email para receber um código de recuperação.",
        `Digite o código de 8 dígitos enviado para ${userEmail}.`,
        "Crie uma nova senha para sua conta.",
        "Sua senha foi redefinida com sucesso.",
    ];
    const titleIndex = recoveryStatus === "idle" ? 0
        : recoveryStatus === "awaiting_code" || recoveryStatus === "verifying" ? 1
        : recoveryStatus === "ready" ? 2
        : 3;

    const inputClass = (hasError: boolean) =>
        `w-full rounded-xl border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground bg-background outline-none transition focus:ring-2 focus:ring-primary/20 ${
            hasError ? "border-red-400" : "border-border focus:border-primary/40"
        }`;

    if (!isOpen) return null;

    return (
        <Portal>
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
                            {recoveryStatus !== "success" && (
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
                            <h2 id="forgot-password-title" className="font-serif text-2xl text-ink">{titles[titleIndex]}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{subtitles[titleIndex]}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="ml-4 mt-1 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                            aria-label="Fechar modal"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    <div className="px-6 pb-6">
                        {/* Error */}
                        {recoveryError && (
                            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/20">
                                <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                                <p className="text-xs text-red-700 dark:text-red-400">{recoveryError}</p>
                            </div>
                        )}

                        {/* Step 1: Email */}
                        {recoveryStatus === "idle" && (
                            <form onSubmit={handleRequestCode} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
                                            placeholder="seu@email.com"
                                            className={`${inputClass(!!errors.email)} pl-10`}
                                            disabled={isLoading}
                                            autoComplete="email"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {isLoading ? (
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
                        {(recoveryStatus === "awaiting_code" || recoveryStatus === "verifying") && (
                            <form onSubmit={handleVerifyCode} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                        Código de verificação
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={8}
                                        pattern="[0-9]{8}"
                                        value={otp}
                                        onChange={e => { const v = e.target.value.replace(/\D/g, ""); setOtp(v); if (errors.otp) setErrors(p => ({ ...p, otp: undefined })); }}
                                        placeholder="00000000"
                                        className={`${inputClass(!!errors.otp)} text-center font-mono text-2xl tracking-[0.5em]`}
                                        disabled={isLoading}
                                        autoComplete="one-time-code"
                                        autoFocus
                                    />
                                    {errors.otp && <p className="text-xs text-red-500">{errors.otp}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {isLoading ? (
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
                                    disabled={cooldownRemaining > 0}
                                    className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {cooldownRemaining > 0 ? `Reenviar em ${cooldownRemaining}s` : "Reenviar código"}
                                </button>
                            </form>
                        )}

                        {/* Step 3: Nova senha */}
                        {recoveryStatus === "ready" && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                        Nova senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={e => { setNewPassword(e.target.value); if (errors.newPassword) setErrors(p => ({ ...p, newPassword: undefined })); }}
                                            placeholder="Mínimo 6 caracteres"
                                            className={`${inputClass(!!errors.newPassword)} pr-10`}
                                            disabled={isLoading}
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
                                    {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                        Confirmar nova senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={e => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(p => ({ ...p, confirmPassword: undefined })); }}
                                            placeholder="Repita a senha"
                                            className={`${inputClass(!!errors.confirmPassword)} pr-10`}
                                            disabled={isLoading}
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
                                    {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {isLoading ? (
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
                        {recoveryStatus === "success" && (
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
        </Portal>
    );
}
