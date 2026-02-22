"use client";

import { AlertCircle, Check, Eye, EyeOff, Mail, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useForgotPasswordModal } from "../context/ForgotPasswordModalContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { isValidEmail, isValidPassword } from "../lib/validators";
import Portal from "./Portal";

/**
 * ForgotPasswordModal Component
 * Modal para recuperação de senha
 *
 * Princípios aplicados:
 * - SRP: Componente focado exclusivamente em recuperação de senha
 * - Clean Code: Nomes reveladores de intenção, funções pequenas
 * - Clean Architecture: Usa casos de uso via hook
 */

export default function ForgotPasswordModal() {
    const { isOpen, mode, email: initialEmail, closeModal } = useForgotPasswordModal();
    const { sendPasswordReset, resetPasswordWithToken, isLoading, error: authError, clearError } = useAuth();

    // Estados do formulário
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; newPassword?: string; confirmPassword?: string }>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Hook para travar scroll do body
    useBodyScrollLock(isOpen);

    // Inicializa email quando modal abre
    useEffect(() => {
        if (isOpen) {
            setEmail(initialEmail);
            setNewPassword("");
            setConfirmPassword("");
            setErrors({});
            setSuccessMessage(null);
            setShowPassword(false);
            setShowConfirmPassword(false);
            clearError();
        }
    }, [isOpen, initialEmail, clearError]);

    /**
     * Valida formulário de solicitação
     */
    const validateRequestForm = (): boolean => {
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
     * Valida formulário de reset
     */
    const validateResetForm = (): boolean => {
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
     * Handler para solicitar recuperação de senha
     */
    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateRequestForm()) {
            return;
        }

        try {
            await sendPasswordReset(email);
            setSuccessMessage(
                "Email de recuperação enviado! Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.",
            );
            setEmail("");
        } catch (err) {
            // Erro já está no contexto
            console.error("Erro ao solicitar reset:", err);
        }
    };

    /**
     * Handler para redefinir senha com token
     */
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateResetForm()) {
            return;
        }

        try {
            await resetPasswordWithToken(newPassword, confirmPassword);
            setSuccessMessage("Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.");
            setNewPassword("");
            setConfirmPassword("");

            // Fecha o modal após 2 segundos
            setTimeout(() => {
                closeModal();
            }, 2000);
        } catch (err) {
            // Erro já está no contexto
            console.error("Erro ao redefinir senha:", err);
        }
    };

    /**
     * Fecha o modal
     */
    const handleClose = () => {
        if (!isLoading) {
            closeModal();
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
                            <h2 className="text-2xl font-bold text-white">
                                {mode === "request" ? "Recuperar Senha" : "Redefinir Senha"}
                            </h2>
                            <button
                                onClick={handleClose}
                                disabled={isLoading}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                                aria-label="Fechar modal"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-white/70">
                            {mode === "request"
                                ? "Insira seu email para receber instruções de recuperação"
                                : "Crie uma nova senha para sua conta"}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6">
                        {/* Success Message */}
                        {successMessage && (
                            <div className="mb-4 p-4 rounded-lg bg-green-500/20 border border-green-500/30 flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-green-100">{successMessage}</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {authError && (
                            <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-100">{authError}</p>
                            </div>
                        )}

                        {/* Request Form */}
                        {mode === "request" && !successMessage && (
                            <form onSubmit={handleRequestReset} className="space-y-4">
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
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-brand-blue/90 hover:to-blue-600/90 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Enviando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5" />
                                            <span>Enviar Link de Recuperação</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Reset Form */}
                        {mode === "reset" && !successMessage && (
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
                                    className="w-full py-3 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-brand-blue/90 hover:to-blue-600/90 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    </div>
                </div>
            </div>
        </Portal>
    );
}
