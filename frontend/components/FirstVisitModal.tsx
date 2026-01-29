"use client";

import { useState } from "react";
import { Mail, Phone, Sparkles, X } from "lucide-react";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { formatPhone } from "../lib/formatters";
import { isValidEmail, isValidPhone } from "../lib/validators";
import { useAuthModal } from "../context/AuthModalContext";
import Portal from "./Portal";

/**
 * FirstVisitModal Component
 * Modal de inscrição exibido no primeiro acesso do usuário
 *
 * Princípios aplicados:
 * - SRP: Focado em coletar dados iniciais e redirecionar para AuthModal
 * - OCP: Aberto para extensão via props
 * - Clean Code: Nomes reveladores de intenção
 */

interface FirstVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormErrors {
    email?: string;
    celular?: string;
}

export default function FirstVisitModal({ isOpen, onClose }: FirstVisitModalProps) {
    const [email, setEmail] = useState("");
    const [celular, setCelular] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    const { openModal: openAuthModal } = useAuthModal();

    // Hook para travar scroll do body
    useBodyScrollLock(isOpen);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: undefined }));
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setCelular(formatted);
        if (errors.celular) {
            setErrors(prev => ({ ...prev, celular: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email é obrigatório";
        } else if (!isValidEmail(email)) {
            newErrors.email = "Email inválido";
        }

        if (!celular.trim()) {
            newErrors.celular = "Celular é obrigatório";
        } else if (!isValidPhone(celular)) {
            newErrors.celular = "Celular inválido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        // Fecha o FirstVisitModal com animação
        onClose();

        // Aguarda animação de saída antes de abrir AuthModal
        setTimeout(() => {
            openAuthModal({ email, celular }, "signup");
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-9999 flex items-center justify-center p-4" onClick={onClose}>
                {/* Backdrop com blur */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                {/* Modal Container */}
                <div
                    className="relative w-full max-w-lg bg-bg-primary/95 backdrop-blur-xl border border-border-glass rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 z-10"
                        aria-label="Fechar modal"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl mb-4">
                                <Sparkles className="w-7 h-7 text-blue-400" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                Receba nossa curadoria semanal
                            </h2>
                            <p className="text-text-secondary text-base sm:text-lg">
                                Conhecimento e IA acessível direto no seu email e WhatsApp.
                            </p>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            {/* Email Input */}
                            <div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                    <input
                                        id="first-visit-email"
                                        name="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={handleEmailChange}
                                        autoComplete="email"
                                        className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border ${
                                            errors.email ? "border-red-500" : "border-border-glass"
                                        } rounded-xl text-white placeholder:text-text-secondary/60 outline-none focus:border-brand-blue focus:bg-white/[0.07] transition-all duration-200`}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.email}</p>}
                            </div>

                            {/* Phone Input */}
                            <div>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                    <input
                                        id="first-visit-celular"
                                        name="celular"
                                        type="tel"
                                        placeholder="(00) 00000-0000"
                                        value={celular}
                                        onChange={handlePhoneChange}
                                        maxLength={15}
                                        autoComplete="tel"
                                        className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border ${
                                            errors.celular ? "border-red-500" : "border-border-glass"
                                        } rounded-xl text-white placeholder:text-text-secondary/60 outline-none focus:border-brand-blue focus:bg-white/[0.07] transition-all duration-200`}
                                    />
                                </div>
                                {errors.celular && (
                                    <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.celular}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-[1.02] active:scale-95 transition-all duration-200"
                            >
                                Continuar
                            </button>

                            {/* Privacy Note */}
                            <p className="text-xs text-text-secondary/60 text-center">
                                Respeitamos sua privacidade. Cancele quando quiser.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
