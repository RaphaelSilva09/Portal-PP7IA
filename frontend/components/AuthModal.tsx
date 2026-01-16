"use client";

import { Eye, EyeOff, LogIn, Mail, Phone, User, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * AuthModal Component
 * Modal de autenticação que alterna entre Login e Cadastro
 * 
 * Princípios aplicados:
 * - SRP: Componente focado exclusivamente em autenticação
 * - OCP: Aberto para extensão via props, fechado para modificação
 * - Clean Code: Nomes reveladores de intenção, funções pequenas
 */

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "login" | "signup";
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
}

export default function AuthModal({ isOpen, onClose, initialMode = "signup" }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        nome: "",
        email: "",
        celular: "",
        senha: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Desabilita scroll do body quando modal está aberto (iOS-friendly)
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";
            document.body.style.overflow = "hidden";

            return () => {
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";
                document.body.style.overflow = "";
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    // Reseta o formulário quando o modo muda
    useEffect(() => {
        setFormData({
            nome: "",
            email: "",
            celular: "",
            senha: "",
        });
        setErrors({});
        setShowPassword(false);
    }, [mode]);

    /**
     * Valida email usando regex padrão
     * Side-Effect-Free Function (Clean Code)
     */
    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    /**
     * Valida celular brasileiro (formato: (XX) XXXXX-XXXX ou similar)
     * Side-Effect-Free Function (Clean Code)
     */
    const isValidPhone = (phone: string): boolean => {
        const cleanPhone = phone.replace(/\D/g, "");
        return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    };

    /**
     * Valida senha (mínimo 6 caracteres)
     * Side-Effect-Free Function (Clean Code)
     */
    const isValidPassword = (password: string): boolean => {
        return password.length >= 6;
    };

    /**
     * Formata celular enquanto usuário digita
     * Pure Function - Não altera estado diretamente
     */
    const formatPhone = (value: string): string => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        }
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    };

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
     * Separation of Concerns: Validação separada da submissão
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // TODO: Implementar chamada à API
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simula chamada API

            if (mode === "login") {
                console.log("Login:", { email: formData.email, senha: formData.senha });
            } else {
                console.log("Cadastro:", formData);
            }

            // Sucesso: fechar modal e limpar formulário
            onClose();
        } catch (error) {
            console.error("Erro ao processar:", error);
            setErrors({ email: "Ocorreu um erro. Tente novamente." });
        } finally {
            setIsSubmitting(false);
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
    const title = isLoginMode ? "Entrar" : "Criar Conta";
    const subtitle = isLoginMode
        ? "Entre com suas credenciais para acessar sua conta"
        : "Crie sua conta para ter acesso completo ao portal";
    const submitButtonText = isLoginMode ? "Entrar" : "Criar Conta";
    const toggleText = isLoginMode ? "Não tem uma conta?" : "Já tem uma conta?";
    const toggleButtonText = isLoginMode ? "Criar conta" : "Entrar";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={onClose}
            style={{ touchAction: "none" }}
        >
            {/* Backdrop com glassmorphism */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

            {/* Modal Container */}
            <div
                className="relative w-full max-w-md bg-bg-primary/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header com Close Button */}
                <div className="flex items-center justify-between p-6 pb-0">
                    <div className="flex items-center gap-2">
                        {isLoginMode ? (
                            <LogIn className="w-6 h-6 text-brand-blue" />
                        ) : (
                            <UserPlus className="w-6 h-6 text-brand-green" />
                        )}
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-secondary hover:text-white bg-bg-primary/80 hover:bg-white/10 rounded-full transition-all duration-200 border border-white/10"
                        aria-label="Fechar modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Subtitle */}
                <p className="px-6 pt-2 text-sm text-text-secondary">{subtitle}</p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Nome - Apenas no modo Cadastro */}
                    {!isLoginMode && (
                        <div className="space-y-2">
                            <label htmlFor="nome" className="block text-sm font-medium text-text-primary">
                                Nome Completo
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                <input
                                    id="nome"
                                    type="text"
                                    value={formData.nome}
                                    onChange={handleInputChange("nome")}
                                    placeholder="Digite seu nome completo"
                                    className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${
                                        errors.nome ? "border-red-500" : "border-white/10"
                                    } rounded-xl text-white placeholder:text-gray-500 outline-none focus:border-brand-green focus:bg-white/[0.07] transition-all duration-200`}
                                />
                            </div>
                            {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange("email")}
                                placeholder="seu@email.com"
                                className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${
                                    errors.email ? "border-red-500" : "border-white/10"
                                } rounded-xl text-white placeholder:text-gray-500 outline-none focus:border-brand-blue focus:bg-white/[0.07] transition-all duration-200`}
                            />
                        </div>
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    {/* Celular - Apenas no modo Cadastro */}
                    {!isLoginMode && (
                        <div className="space-y-2">
                            <label htmlFor="celular" className="block text-sm font-medium text-text-primary">
                                Celular
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                <input
                                    id="celular"
                                    type="tel"
                                    value={formData.celular}
                                    onChange={handleInputChange("celular")}
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                    className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${
                                        errors.celular ? "border-red-500" : "border-white/10"
                                    } rounded-xl text-white placeholder:text-gray-500 outline-none focus:border-brand-green focus:bg-white/[0.07] transition-all duration-200`}
                                />
                            </div>
                            {errors.celular && <p className="text-sm text-red-500">{errors.celular}</p>}
                        </div>
                    )}

                    {/* Senha */}
                    <div className="space-y-2">
                        <label htmlFor="senha" className="block text-sm font-medium text-text-primary">
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                id="senha"
                                type={showPassword ? "text" : "password"}
                                value={formData.senha}
                                onChange={handleInputChange("senha")}
                                placeholder="Mínimo 6 caracteres"
                                className={`w-full px-4 pr-11 py-3 bg-white/5 border ${
                                    errors.senha ? "border-red-500" : "border-white/10"
                                } rounded-xl text-white placeholder:text-gray-500 outline-none focus:border-brand-blue focus:bg-white/[0.07] transition-all duration-200`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.senha && <p className="text-sm text-red-500">{errors.senha}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full px-6 py-3 ${
                            isLoginMode
                                ? "bg-linear-to-r from-blue-500 to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                                : "bg-linear-to-r from-green-500 to-emerald-600 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]"
                        } text-white font-semibold rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                    >
                        {isSubmitting ? "Processando..." : submitButtonText}
                    </button>

                    {/* Toggle Mode */}
                    <div className="pt-4 text-center border-t border-white/10">
                        <p className="text-sm text-text-secondary">
                            {toggleText}{" "}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className={`font-semibold ${
                                    isLoginMode ? "text-brand-green" : "text-brand-blue"
                                } hover:underline transition-colors`}
                            >
                                {toggleButtonText}
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
