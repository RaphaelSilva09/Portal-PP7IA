/**
 * FeedbackMessage Component (Admin UI)
 *
 * Mensagem de feedback centralizada após ações.
 * Projetado para idosos 80+: grande, central, clara.
 *
 * Princípios de UX:
 * - Aparece no centro da tela
 * - Font-size grande (20px)
 * - Desaparece automaticamente após 3s
 * - Fundo com contraste alto
 */

"use client";

import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useEffect } from "react";

export type FeedbackType = "success" | "error" | "warning";

export interface FeedbackMessageProps {
    isVisible: boolean;
    type: FeedbackType;
    message: string;
    onClose: () => void;
}

export function FeedbackMessage({ isVisible, type, message, onClose }: FeedbackMessageProps) {
    // Auto-close após 3 segundos
    useEffect(() => {
        if (!isVisible) return;

        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const styles = {
        success: {
            bg: "bg-green-600",
            border: "border-green-500",
            icon: CheckCircle2,
        },
        error: {
            bg: "bg-red-600",
            border: "border-red-500",
            icon: XCircle,
        },
        warning: {
            bg: "bg-orange-600",
            border: "border-orange-500",
            icon: AlertCircle,
        },
    };

    const { bg, border, icon: Icon } = styles[type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className={`${bg} ${border} border-2 rounded-2xl shadow-2xl px-8 py-6 max-w-md w-full`}>
                <div className="flex items-center gap-4">
                    <Icon className="w-10 h-10 text-white flex-shrink-0" />
                    <p className="text-xl font-semibold text-white leading-relaxed">{message}</p>
                </div>
            </div>
        </div>
    );
}
