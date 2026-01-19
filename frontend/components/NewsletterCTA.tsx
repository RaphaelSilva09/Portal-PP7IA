"use client";

import { useState } from "react";

interface NewsletterCTAProps {
    title?: string;
    description?: string;
    onSubscribe?: (email: string, celular: string) => void;
}

export default function NewsletterCTA({
    title = "Receba nossa curadoria semanal",
    description = "No seu email e whatsapp.",
    onSubscribe,
}: NewsletterCTAProps) {
    const [email, setEmail] = useState("");
    const [celular, setCelular] = useState("");
    const [errors, setErrors] = useState<{ email?: string; celular?: string }>({});

    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isValidPhone = (phone: string): boolean => {
        const cleanPhone = phone.replace(/\D/g, "");
        return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    };

    const formatPhone = (value: string): string => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        }
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setCelular(formatted);
        if (errors.celular) {
            setErrors(prev => ({ ...prev, celular: undefined }));
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: undefined }));
        }
    };

    const handleSubmit = () => {
        const newErrors: { email?: string; celular?: string } = {};

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

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Chama callback se fornecido
        if (onSubscribe) {
            onSubscribe(email, celular);
        }
    };

    return (
        <div id="cta" className="glass-card rounded-2xl p-6 sm:p-8 mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-text-secondary text-base sm:text-2xl">{description}</p>
                </div>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                    <div className="flex-1 sm:w-64">
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={handleEmailChange}
                            className={`w-full px-4 py-3 bg-bg-primary border ${
                                errors.email ? "border-red-500" : "border-border-glass"
                            } rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-brand-blue transition-colors touch-target`}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div className="flex-1 sm:w-64">
                        <input
                            type="tel"
                            placeholder="(00) 00000-0000"
                            value={celular}
                            onChange={handlePhoneChange}
                            maxLength={15}
                            className={`w-full px-4 py-3 bg-bg-primary border ${
                                errors.celular ? "border-red-500" : "border-border-glass"
                            } rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-brand-blue transition-colors touch-target`}
                        />
                        {errors.celular && <p className="text-xs text-red-500 mt-1">{errors.celular}</p>}
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 touch-target whitespace-nowrap"
                    >
                        Inscrever-se
                    </button>
                </div>
            </div>
        </div>
    );
}
