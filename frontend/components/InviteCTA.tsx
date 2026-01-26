"use client";

import { useState } from "react";

interface InviteCTAProps {
    title?: string;
    description?: string;
    onInviteSent?: (email: string) => void;
}

export default function InviteCTA({
    title = "Convide alguém para a plataforma",
    description = "Envie um link de acesso por email.",
    onInviteSent,
}: InviteCTAProps) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) {
            setError(null);
        }
        if (success) {
            setSuccess(false);
        }
    };

    const handleSubmit = async () => {
        if (!email.trim()) {
            setError("Email é obrigatório");
            return;
        }

        if (!isValidEmail(email)) {
            setError("Email inválido");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/admin/invite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Erro ao enviar convite");
                return;
            }

            setSuccess(true);
            setEmail("");
            onInviteSent?.(email);
        } catch {
            setError("Erro ao conectar com o servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="invite-cta" className="glass-card rounded-2xl p-6 sm:p-8 mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-text-secondary text-base sm:text-2xl">{description}</p>
                </div>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                    <div className="flex-1 sm:w-80">
                        <input
                            type="email"
                            placeholder="email@exemplo.com"
                            value={email}
                            onChange={handleEmailChange}
                            disabled={loading}
                            className={`w-full px-4 py-3 bg-bg-primary border ${
                                error ? "border-red-500" : success ? "border-green-500" : "border-border-glass"
                            } rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-brand-blue transition-colors touch-target disabled:opacity-50`}
                        />
                        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                        {success && <p className="text-xs text-green-500 mt-1">Convite enviado com sucesso!</p>}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 touch-target whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {loading ? "Enviando..." : "Enviar Convite"}
                    </button>
                </div>
            </div>
        </div>
    );
}
