"use client";

import { AlertCircle, Check, Eye, EyeOff, LogIn, Mail, Phone, User, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useForgotPasswordModal } from "../context/ForgotPasswordModalContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { formatPhone } from "../lib/formatters";
import { isValidEmail, isValidPassword, isValidPhone } from "../lib/validators";
import Portal from "./Portal";

/**
 * AuthModal Component
 * Modal de autenticação que alterna entre Login e Cadastro
 *
 * Princípios aplicados:
 * - SRP: Componente focado exclusivamente em autenticação
 * - OCP: Aberto para extensão via props, fechado para modificação
 * - Clean Code: Nomes reveladores de intenção, funções pequenas
 * - Clean Architecture: Usa casos de uso via hook, não conhece infraestrutura
 */

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "login" | "signup";
    initialData?: {
        email?: string;
        celular?: string;
    };
}

type AuthMode = "login" | "signup";

interface FormData {
    nome: string;
    email: string;
    celular: string;
    senha: string;
}

interface FormErrors {
    nome?: string;
    email?: string;
    celular?: string;
    senha?: string;
    consent?: string;
}

export default function AuthModal({ isOpen, onClose, initialMode = "signup", initialData }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        nome: "",
        email: initialData?.email || "",
        celular: initialData?.celular || "",
        senha: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [acceptEmailUpdates, setAcceptEmailUpdates] = useState(false);
    const [acceptWhatsAppUpdates, setAcceptWhatsAppUpdates] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Hook de autenticação (Clean Architecture)
    const { signUp, signIn, isLoading, error: authError, clearError } = useAuth();
    const { openModal: openForgotPasswordModal } = useForgotPasswordModal();
    const router = useRouter();

    // Hook para travar scroll do body (DRY - extraído para hook reutilizável)
    useBodyScrollLock(isOpen);

    // Sincroniza o modo com initialMode quando o modal abre
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
        }
    }, [isOpen, initialMode]);

    // Reseta o formulário quando o modo muda ou modal abre
    useEffect(() => {
        if (isOpen) {
            setFormData({
                nome: "",
                email: initialData?.email || "",
                celular: initialData?.celular || "",
                senha: "",
            });
            setErrors({});
            setShowPassword(false);
            setAcceptEmailUpdates(false);
            setAcceptWhatsAppUpdates(false);
            clearError();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, isOpen, initialData]);

    /**
     * Valida o formulário baseado no modo atual
     * Tell, Don't Ask - Retorna resultado ao invés de modificar estado
     */
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (mode === "signup") {
            if (!formData.nome.trim()) {
                newErrors.nome = "Nome é obrigatório";
            }

            if (!formData.celular.trim()) {
                newErrors.celular = "Celular é obrigatório";
            } else if (!isValidPhone(formData.celular)) {
                newErrors.celular = "Celular inválido";
            }

            if (!acceptEmailUpdates && !acceptWhatsAppUpdates) {
                newErrors.consent = "Aceite pelo menos uma forma de receber atualizações";
            }
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email é obrigatório";
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = "Email inválido";
        }

        if (!formData.senha.trim()) {
            newErrors.senha = "Senha é obrigatória";
        } else if (!isValidPassword(formData.senha)) {
            newErrors.senha = "Senha deve ter no mínimo 6 caracteres";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handler para mudança de input
     * Single Responsibility: Apenas atualiza o estado do formulário
     */
    const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Formata telefone em tempo real
        if (field === "celular") {
            value = formatPhone(value);
        }

        setFormData(prev => ({ ...prev, [field]: value }));

        // Limpa erro do campo quando usuário começa a digitar
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    /**
     * Handler para submit do formulário
     * Clean Architecture: Usa casos de uso através do hook
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (mode === "login") {
                await signIn({
                    email: formData.email,
                    password: formData.senha,
                });
                onClose();
                router.push("/home");
            } else {
                const result = await signUp({
                    email: formData.email,
                    password: formData.senha,
                    nome: formData.nome,
                    celular: formData.celular,
                    acceptEmailUpdates,
                    acceptWhatsAppUpdates,
                });

                if (result.emailConfirmationRequired) {
                    setSuccessMessage(
                        "Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta. Se não encontrar, verifique a pasta de spam.",
                    );
                } else {
                    onClose();
                }
            }
        } catch (error) {
            console.error("Erro ao processar autenticação:", error);
        }
    };

    /**
     * Alterna entre modo login e cadastro
     * Command Pattern - Ação encapsulada
     */
    const toggleMode = () => {
        setMode(prev => (prev === "login" ? "signup" : "login"));
    };

    if (!isOpen) return null;

    const isLoginMode = mode === "login";
    const title = isLoginMode ? "Entrar" : "Cadastrar";
    const subtitle = isLoginMode
        ? "Entre com suas credenciais para acessar sua conta"
        : "Crie sua conta para ter acesso completo ao portal";
    const submitButtonText = isLoginMode ? "Entrar" : "Cadastrar";
    const toggleText = isLoginMode ? "Não tem uma conta?" : "Já tem uma conta?";
    const toggleButtonText = isLoginMode ? "Cadastrar" : "Entrar";

    return (
        <Portal>
            <div className="fixed inset-0 z-9999 flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
                {/* Backdrop com glassmorphism */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />

                {/* Modal Container */}
                <div
                    className="relative w-full max-w-md max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col bg-bg-primary/95 backdrop-blur-xl border border-border-glass rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header com Close Button */}
                    <div className="flex items-center justify-between p-4 pb-0">
                        <div className="flex items-center gap-2">
                            {isLoginMode ? (
                                <LogIn className="w-5 h-5 text-blue-500" />
                            ) : (
                                <UserPlus className="w-5 h-5 text-blue-500" />
                            )}
                            <h2 className="text-xl font-bold text-white">{title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-text-secondary hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                            aria-label="Fechar modal"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Subtitle */}
                    <p className="px-4 pt-1.5 pb-2 text-xs text-text-secondary">{subtitle}</p>

                    {/* Error Message from Auth */}
                    {authError && (
                        <div className="mx-4 mb-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-300">{authError}</p>
                        </div>
                    )}

                    {/* Success Message - Email Confirmation */}
                    {successMessage && (
                        <div className="mx-4 mb-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <div className="flex items-start gap-2 mb-3">
                                <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-green-300">{successMessage}</p>
                                    <p className="text-xs text-green-300/70 mt-1">
                                        Enquanto isso, explore nosso conteúdo gratuito.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 text-sm font-medium transition-all duration-200"
                            >
                                Explorar Conteúdo
                            </button>
                        </div>
                    )}

                    {/* Form Container com scroll interno */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-4 pt-0 space-y-3">
                            {/* Nome - Apenas no modo Cadastro */}
                            {!isLoginMode && (
                                <div className="space-y-1 animate-fade-in">
                                    <label htmlFor="nome" className="block text-xs font-medium text-text-primary">
                                        Nome Completo
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                        <input
                                            id="nome"
                                            name="nome"
                                            type="text"
                                            value={formData.nome}
                                            onChange={handleInputChange("nome")}
                                            placeholder="Digite seu nome completo"
                                            autoComplete="name"
                                            className={`w-full pl-10 pr-3 py-2 bg-white/5 border ${
                                                errors.nome ? "border-red-500" : "border-border-glass"
                                            } rounded-xl text-white placeholder:text-text-secondary/50 outline-none focus:border-brand-green focus:bg-white/[0.07] transition-all duration-200`}
                                        />
                                    </div>
                                    {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-1">
                                <label htmlFor="email" className="block text-xs font-medium text-text-primary">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange("email")}
                                        placeholder="seu@email.com"
                                        autoComplete="email"
                                        className={`w-full pl-10 pr-3 py-2 bg-white/5 border ${
                                            errors.email ? "border-red-500" : "border-border-glass"
                                        } rounded-xl text-white placeholder:text-text-secondary/50 outline-none focus:border-brand-blue focus:bg-white/[0.07] transition-all duration-200`}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>

                            {/* Celular - Apenas no modo Cadastro */}
                            {!isLoginMode && (
                                <div className="space-y-1 animate-fade-in">
                                    <label htmlFor="celular" className="block text-xs font-medium text-text-primary">
                                        Celular
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                        <input
                                            id="celular"
                                            name="celular"
                                            type="tel"
                                            value={formData.celular}
                                            onChange={handleInputChange("celular")}
                                            placeholder="(00) 00000-0000"
                                            maxLength={15}
                                            autoComplete="tel"
                                            className={`w-full pl-10 pr-3 py-2 bg-white/5 border ${
                                                errors.celular ? "border-red-500" : "border-border-glass"
                                            } rounded-xl text-white placeholder:text-text-secondary/50 outline-none focus:border-brand-green focus:bg-white/[0.07] transition-all duration-200`}
                                        />
                                    </div>
                                    {errors.celular && <p className="text-xs text-red-500">{errors.celular}</p>}
                                </div>
                            )}

                            {/* Senha */}
                            <div className="space-y-1">
                                <label htmlFor="senha" className="block text-xs font-medium text-text-primary">
                                    Senha
                                </label>
                                <div className="relative">
                                    <input
                                        id="senha"
                                        name="senha"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.senha}
                                        onChange={handleInputChange("senha")}
                                        placeholder="Mínimo 6 caracteres"
                                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                                        className={`w-full px-3 pr-10 py-2 bg-white/5 border ${
                                            errors.senha ? "border-red-500" : "border-border-glass"
                                        } rounded-xl text-white placeholder:text-text-secondary/50 outline-none focus:border-brand-blue focus:bg-white/[0.07] transition-all duration-200`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.senha && <p className="text-xs text-red-500">{errors.senha}</p>}
                            </div>

                            {!isLoginMode && (
                                <div className="space-y-2 pt-1 animate-fade-in">
                                    <div className="space-y-2">
                                        <label
                                            className="flex items-center gap-2 cursor-pointer group"
                                            onClick={() => {
                                                const newValue = !acceptEmailUpdates;
                                                setAcceptEmailUpdates(newValue);
                                                if (errors.consent && (newValue || acceptWhatsAppUpdates)) {
                                                    setErrors(prev => ({ ...prev, consent: undefined }));
                                                }
                                            }}
                                        >
                                            <div
                                                className={`w-4 h-4 min-w-[1rem] min-h-[1rem] rounded border border-text-secondary flex items-center justify-center cursor-pointer transition-colors group-hover:border-text-primary ${
                                                    acceptEmailUpdates ? "bg-text-secondary" : "bg-transparent"
                                                }`}
                                            >
                                                {acceptEmailUpdates && <Check className="w-3 h-3 text-bg-primary" />}
                                            </div>
                                            <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors leading-4">
                                                Aceito receber atualizações e novidades por e-mail
                                            </span>
                                        </label>

                                        <label
                                            className="flex items-center gap-2 cursor-pointer group"
                                            onClick={() => {
                                                const newValue = !acceptWhatsAppUpdates;
                                                setAcceptWhatsAppUpdates(newValue);
                                                if (errors.consent && (newValue || acceptEmailUpdates)) {
                                                    setErrors(prev => ({ ...prev, consent: undefined }));
                                                }
                                            }}
                                        >
                                            <div
                                                className={`w-4 h-4 min-w-[1rem] min-h-[1rem] rounded border border-text-secondary flex items-center justify-center cursor-pointer transition-colors group-hover:border-text-primary ${
                                                    acceptWhatsAppUpdates ? "bg-text-secondary" : "bg-transparent"
                                                }`}
                                            >
                                                {acceptWhatsAppUpdates && <Check className="w-3 h-3 text-bg-primary" />}
                                            </div>
                                            <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors leading-4">
                                                Aceito receber atualizações e novidades via WhatsApp
                                            </span>
                                        </label>
                                    </div>
                                    {errors.consent && <p className="text-xs text-red-500">{errors.consent}</p>}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full px-5 py-2.5 flex items-center justify-center gap-2 ${
                                    isLoginMode
                                        ? "bg-linear-to-r from-blue-600 to-purple-700 shadow-[0_0_20px_rgba(29,78,216,0.35)] hover:shadow-[0_0_30px_rgba(29,78,216,0.5)]"
                                        : "bg-linear-to-r from-blue-600 to-purple-700 shadow-[0_0_20px_rgba(22,163,74,0.35)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)]"
                                } text-white font-semibold text-sm rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processando...</span>
                                    </>
                                ) : (
                                    submitButtonText
                                )}
                            </button>

                            {/* Toggle Mode */}
                            <div className="pt-3 text-center border-t border-border-glass">
                                <p className="text-xs text-text-secondary">
                                    {toggleText}{" "}
                                    <button
                                        type="button"
                                        onClick={toggleMode}
                                        className={`font-semibold ${
                                            isLoginMode ? "text-blue-500" : "text-blue-500"
                                        } hover:underline transition-colors`}
                                    >
                                        {toggleButtonText}
                                    </button>
                                </p>

                                {/* Link Esqueceu Senha - Apenas no modo Login */}
                                {mode === "login" && (
                                    <p className="text-xs text-text-secondary mt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                openForgotPasswordModal();
                                            }}
                                            className="text-brand-blue hover:text-blue-400 transition-colors"
                                        >
                                            Esqueceu sua senha?
                                        </button>
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
