"use client";

import { useAuth } from "@/context/AuthContext";
import { useForgotPasswordModal } from "@/context/ForgotPasswordModalContext";
import { usePasswordRecovery } from "@/hooks/usePasswordRecovery";
import { isValidPassword } from "@/lib/validators";
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

/**
 * Reset Password Page Content
 */
function ResetPasswordPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { openModal: openForgotPasswordModal } = useForgotPasswordModal();
    const { recoveryStatus, recoveryError, isLoading, resetPassword } = usePasswordRecovery();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLegacyLink, setIsLegacyLink] = useState(false);

    // TODO: Remove this page after 2026-04-22 (60 days post-migration)

    // Verifica se há token de link antigo e mostra mensagem de deprecação
    useEffect(() => {
        const resetToken = searchParams.get("resetToken");
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const hasAnyToken = resetToken || accessToken || refreshToken;

        // Se detectar link antigo, marca como legacy e evita processamento adicional
        if (hasAnyToken) {
            setIsLegacyLink(true);
            return;
        }

        // Se não há tokens e não há usuário logado, redireciona para home
        if (!user) {
            router.push("/");
        }
    }, [searchParams, user, router]);

    /**
     * Valida formulário
     */
    const validateForm = (): boolean => {
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
     * Handler para redefinir senha
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const success = await resetPassword(newPassword, confirmPassword);
        if (success) {
            setSuccessMessage("Senha redefinida com sucesso! Redirecionando...");
            setNewPassword("");
            setConfirmPassword("");

            // Redireciona após 2 segundos
            setTimeout(() => {
                router.push(user ? "/user" : "/");
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Voltar para o início</span>
                </Link>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                    {/* Legacy Link Deprecation Message */}
                    {isLegacyLink ? (
                        <>
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-white/10">
                                <h1 className="text-2xl font-bold text-white">Método Atualizado</h1>
                                <p className="mt-2 text-sm text-white/70">Nossa recuperação de senha foi aprimorada</p>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-6">
                                <div className="mb-4 p-4 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-blue-100 mb-2">
                                            <strong>Os links de recuperação foram atualizados.</strong>
                                        </p>
                                        <p className="text-sm text-blue-100/80 mb-3">
                                            Agora usamos um código de 8 dígitos enviado por email, que é mais seguro e
                                            confiável.
                                        </p>
                                        <p className="text-sm text-blue-100/80">
                                            Clique no botão abaixo para solicitar um novo código de recuperação.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        router.push("/");
                                        setTimeout(() => openForgotPasswordModal(), 300);
                                    }}
                                    className="w-full py-3 bg-linear-to-r from-brand-blue to-blue-600 hover:from-brand-blue/90 hover:to-blue-600/90 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <span>Solicitar Novo Código</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-white/10">
                                <h1 className="text-2xl font-bold text-white">Redefinir Senha</h1>
                                <p className="mt-2 text-sm text-white/70">Crie uma nova senha para sua conta</p>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-6">
                                {/* Success Message */}
                                {successMessage && (
                                    <div className="mb-4 p-4 rounded-lg bg-green-500/20 border border-green-500/30 flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-green-100">{successMessage}</p>
                                    </div>
                                )}

                                {/* Error Message */}
                                {recoveryError && (
                                    <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-100">{recoveryError}</p>
                                    </div>
                                )}

                                {/* Form */}
                                {!successMessage && (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label
                                                htmlFor="newPassword"
                                                className="block text-sm font-medium text-white mb-2"
                                            >
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
                                                            setErrors(prev => ({
                                                                ...prev,
                                                                confirmPassword: undefined,
                                                            }));
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
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Reset Password Page
 * Página de fallback para redefinição de senha com token
 * Usuários deslogados são redirecionados para o modal
 * Usuários logados podem usar esta página diretamente
 *
 * Princípios aplicados:
 * - SRP: Focada em reset de senha para usuários logados
 * - Clean Architecture: Usa casos de uso via hooks
 */
export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                    <div className="text-white">Carregando...</div>
                </div>
            }
        >
            <ResetPasswordPageContent />
        </Suspense>
    );
}
