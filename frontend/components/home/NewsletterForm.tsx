"use client";

import { useState } from "react";
import { useAuthModal } from "@/context/AuthModalContext";
import { isValidEmail } from "@/lib/validators";

export default function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [validationError, setValidationError] = useState<string | null>(null);
    const { openModal } = useAuthModal();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (status === "loading") return;
        const trimmed = email.trim();
        if (!trimmed) {
            setValidationError("Informe seu e-mail para receber a newsletter.");
            return;
        }
        if (!isValidEmail(trimmed)) {
            setValidationError("E-mail inválido. Confira e tente de novo.");
            return;
        }
        setValidationError(null);
        openModal({ email: trimmed }, "signup");
    }

    if (status === "success") {
        return (
            <div className="space-y-3">
                <label className="block text-[11px] uppercase tracking-[0.22em] text-background/50">
                    Seu e-mail
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-background/15 bg-background/5 px-5 py-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-block-newsletter shrink-0"
                        aria-hidden="true"
                    >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <path d="m9 11 3 3L22 4" />
                    </svg>
                    <p className="text-sm text-background/80">
                        Inscrição confirmada! Você recebe na próxima edição.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <label htmlFor="newsletter-email" className="block text-[11px] uppercase tracking-[0.22em] text-background/50">
                Seu e-mail
            </label>
            <div className="flex flex-col gap-2 rounded-2xl border border-background/15 bg-background/5 p-2 sm:flex-row focus-within:ring-0 focus-within:outline-none">
                <div className="flex flex-1 items-center gap-2 px-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-mail size-4 text-background/40 shrink-0"
                        aria-hidden="true"
                    >
                        <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                    </svg>
                    <input
                        id="newsletter-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (validationError) setValidationError(null);
                        }}
                        placeholder="nome@email.com"
                        required
                        autoComplete="email"
                        aria-invalid={validationError ? true : undefined}
                        aria-describedby={validationError ? "newsletter-email-error" : undefined}
                        className="w-full bg-transparent pt-3 pb-1 text-sm text-background placeholder:text-background/30 border-b border-transparent focus:border-white/60 transition-colors"
                        style={{ outline: "none", boxShadow: "none" }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-background px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-block-newsletter disabled:opacity-60"
                >
                    {status === "loading" ? "Inscrevendo…" : "Inscrever"}
                    {status !== "loading" && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-arrow-up-right size-3.5"
                            aria-hidden="true"
                        >
                            <path d="M7 7h10v10" />
                            <path d="M7 17 17 7" />
                        </svg>
                    )}
                </button>
            </div>
            {validationError && (
                <p id="newsletter-email-error" role="alert" className="text-xs text-red-400">
                    {validationError}
                </p>
            )}
            {status === "error" && (
                <p role="alert" className="text-xs text-red-400">Algo deu errado. Tente novamente.</p>
            )}
        </form>
    );
}



