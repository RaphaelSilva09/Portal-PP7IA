"use client";

import { AlertCircle, Check, Eye, EyeOff, Mail, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForgotPasswordModal } from "../context/ForgotPasswordModalContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { usePasswordRecovery } from "../hooks/usePasswordRecovery";
import { isValidEmail, isValidPassword } from "../lib/validators";
import Portal from "./Portal";

/**
 * ForgotPasswordModal Component
 * Modal para recuperação de senha com fluxo OTP de 3 etapas
 *
 * Fluxo:
 * 1. idle -> Email input (requestReset)
 * 2. awaiting_code/verifying -> OTP input de 8 dígitos (verifyCode)
 * 3. ready -> Password input (resetPassword)
 * 4. success -> Mensagem de sucesso (auto-close)
 *
 * Princípios aplicados:
 * - SRP: Componente focado exclusivamente em recuperação de senha
 * - Clean Code: Nomes reveladores de intenção, funções pequenas
 * - Clean Architecture: Usa casos de uso via hook
 */

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

    // Estados do formulário
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

    // Hook para travar scroll do body
    useBodyScrollLock(isOpen);

    // Limpa formulário quando modal abre
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

    // Fecha modal automaticamente após sucesso
    useEffect(() => {
        if (recoveryStatus === "success") {
            const timer = setTimeout(() => {
                closeModal();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [recoveryStatus, closeModal]);

    /**
     * Valida email
     */
    const validateEmail = (): boolean => {
        const newErrors: { email?: string } = {};

        if (!email.trim()) {
            newErrors.email = "Email é obrigatório";
        } else if (!isValidEmail(email)) {
            newErrors.email = "Email inválido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Valida OTP
     */
    const validateOTP = (): boolean => {
        const newErrors: { otp?: string } = {};

        if (!otp.trim()) {
            newErrors.otp = "Código é obrigatório";
        } else if (!/^\d{8}$/.test(otp)) {
            newErrors.otp = "Código deve ter 8 dígitos";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Valida senha
     */
    const validatePassword = (): boolean => {
        const newErrors: { newPassword?: string; confirmPassword?: string } = {};

        if (!newPassword.trim()) {
            newErrors.newPassword = "Nova senha é obrigatória";
        } else if (!isValidPassword(newPassword, 6)) {
            newErrors.newPassword = "Senha deve ter no mínimo 6 caracteres";
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "Confirmação de senha é obrigatória";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "As senhas não coincidem";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handler para solicitar código OTP
     */
    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail()) {
            return;
        }

        await requestReset(email);
    };

    /**
     * Handler para verificar código OTP
     */
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateOTP()) {
            return;
        }

        await verifyCode(otp);
    };

    /**
     * Handler para reenviar código
     */
    const handleResendCode = async () => {
        if (cooldownRemaining > 0) {
            return;
        }

        setOtp("");
        setErrors({});
        await resendCode();
    };

    /**
     * Handler para redefinir senha
     */
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePassword()) {
            return;
        }

        await resetPassword(newPassword);
    };

    /**
     * Fecha o modal
     */
    const handleClose = () => {
        if (!isLoading) {
            closeModal();
        }
    };

    /**
     * Determina título dinâmico baseado no status
     */
    const getTitle = () => {
        switch (recoveryStatus) {
            case "idle":
                return "Recuperar Senha";
            case "awaiting_code":
            case "verifying":
                return "Verificar Código";
            case "ready":
                return "Redefinir Senha";
            case "success":
                return "Sucesso!";
            default:
                return "Recuperar Senha";
        }
    };

    /**
     * Determina descrição dinâmica baseada no status
     */
    const getDescription = () => {
        switch (recoveryStatus) {
            case "idle":
                return "Insira seu email para receber um código de recuperação";
            case "awaiting_code":
            case "verifying":
                return `Digite o código de 8 dígitos enviado para ${userEmail}`;
            case "ready":
                return "Crie uma nova senha para sua conta";
            case "success":
                return "Sua senha foi redefinida com sucesso!";
            default:
                return "Insira seu email para recuperar sua senha";
        }
    };

    if (!isOpen) return null;

    return (
        <Portal>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={handleClose}
            >
                {/* Modal Container */}
                <div
                    className="relative w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">{getTitle()}</h2>
                            <button
                                onClick={handleClose}
                                disabled={isLoading}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                                aria-label="Fechar modal"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-white/70">{getDescription()}</p>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6">
                        {/* Error Message */}
                        {recoveryError && (
                            <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-100">{recoveryError}</p>
                            </div>
                        )}

                        {/* Step 1: Email Input */}
                        {recoveryStatus === "idle" && (
                            <form onSubmit={handleRequestCode} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={e => {
                                                setEmail(e.target.value);
                                                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                                            }}
                                            placeholder="seu@email.com"
                                            className={`w-full pl-11 pr-4 py-3 bg-white/10 border ${
                                                errors.email ? "border-red-500/50" : "border-white/20"
                                            } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-colors`}
                                            disabled={isLoading}
                                            autoComplete="email"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-linear-to-r from-brand-blue to-blue-600 hover:from-brand-blue/90 hover:to-blue-600/90 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Enviando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5" />
                                            <span>Enviar Código</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Step 2: OTP Input */}
                        {(recoveryStatus === "awaiting_code" || recoveryStatus === "verifying") && (
                            <form onSubmit={handleVerifyCode} className="space-y-4">
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-white mb-2">
                                        Código de Verificação
                                    </label>
                                    <input
                                        id="otp"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={8}
                                        pattern="[0-9]{8}"
                                        value={otp}
                                        onChange={e => {
                                            const value = e.target.value.replace(/\D/g, "");
                                            setOtp(value);
                                            if (errors.otp) setErrors(prev => ({ ...prev, otp: undefined }));
                                        }}
                                        placeholder="00000000"
                                        className={`w-full px-4 py-3 bg-white/10 border ${
                                            errors.otp ? "border-red-500/50" : "border-white/20"
                                        } rounded-lg text-white text-center text-2xl tracking-widest placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-colors`}
                                        disabled={isLoading}
                                        autoComplete="one-time-code"
                                        autoFocus
                                    />
                                    {errors.otp && <p className="mt-1 text-xs text-red-400">{errors.otp}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-linear-to-r from-brand-blue to-blue-600 hover:from-brand-blue/90 hover:to-blue-600/90 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Verificando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            <span>Verificar Código</span>
                                        </>
                                    )}
                                </button>

                                {/* Resend Code Button */}
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={cooldownRemaining > 0}
                                    className="w-full py-2 text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cooldownRemaining > 0
                                        ? `Reenviar código em ${cooldownRemaining}s`
                                        : "Reenviar código"}
                                </button>
                            </form>
                        )}

                        {/* Step 3: Password Input */}
                        {recoveryStatus === "ready" && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                                        Nova Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={e => {
                                                setNewPassword(e.target.value);
                                                if (errors.newPassword)
                                                    setErrors(prev => ({ ...prev, newPassword: undefined }));
                                            }}
                                            placeholder="Mínimo 6 caracteres"
                                            className={`w-full pl-4 pr-11 py-3 bg-white/10 border ${
                                                errors.newPassword ? "border-red-500/50" : "border-white/20"
                                            } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-colors`}
                                            disabled={isLoading}
                                            autoComplete="new-password"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.newPassword && (
                                        <p className="mt-1 text-xs text-red-400">{errors.newPassword}</p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-white mb-2"
                                    >
                                        Confirmar Nova Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={e => {
                                                setConfirmPassword(e.target.value);
                                                if (errors.confirmPassword)
                                                    setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                            }}
                                            placeholder="Repita a senha"
                                            className={`w-full pl-4 pr-11 py-3 bg-white/10 border ${
                                                errors.confirmPassword ? "border-red-500/50" : "border-white/20"
                                            } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-colors`}
                                            disabled={isLoading}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                            aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-linear-to-r from-brand-blue to-blue-600 hover:from-brand-blue/90 hover:to-blue-600/90 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Redefinindo...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            <span>Redefinir Senha</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Step 4: Success Message */}
                        {recoveryStatus === "success" && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
                                    <Check className="w-8 h-8 text-green-400" />
                                </div>
                                <p className="text-white text-center">
                                    Senha redefinida com sucesso!
                                    <br />
                                    <span className="text-sm text-white/70">
                                        Você já pode fazer login com sua nova senha.
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );
}
