"use client";

import { AlertCircle, CheckCircle2, X, XCircle } from "lucide-react";
import { useEffect } from "react";

export type FeedbackType = "success" | "error" | "warning";

export interface FeedbackMessageProps {
    isVisible: boolean;
    type: FeedbackType;
    message: string;
    onClose: () => void;
}

export function FeedbackMessage({ isVisible, type, message, onClose }: FeedbackMessageProps) {
    useEffect(() => {
        if (!isVisible) return;
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const styles = {
        success: { icon: CheckCircle2, color: "text-green-500",  border: "border-green-500/20" },
        error:   { icon: XCircle,      color: "text-red-500",    border: "border-red-500/20"   },
        warning: { icon: AlertCircle,  color: "text-orange-500", border: "border-orange-500/20"},
    };

    const { icon: Icon, color, border } = styles[type];

    return (
        <div className="fixed bottom-6 right-6 z-[9999] w-full max-w-sm">
            <div className={`flex items-center gap-3 rounded-2xl border ${border} bg-card px-4 py-3.5 shadow-xl`}>
                <Icon className={`size-4 shrink-0 ${color}`} />
                <p className="flex-1 text-sm text-foreground">{message}</p>
                <button
                    onClick={onClose}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Fechar"
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}
