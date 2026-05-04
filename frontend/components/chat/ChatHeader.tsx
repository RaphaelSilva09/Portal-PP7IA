"use client";

import { X } from "lucide-react";

interface Props {
    onClose: () => void;
    isStreaming?: boolean;
}

export function ChatHeader({ onClose, isStreaming = false }: Props) {
    const statusLabel = isStreaming ? "Gerando resposta..." : "Online · Gemini";

    return (
        <div className="flex items-start gap-3 border-b border-border/80 bg-linear-to-r from-background/95 via-card to-accent/45 px-4 py-3.5 dark:from-card dark:via-card dark:to-accent/25">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 text-primary-foreground text-sm shadow-[0_3px_10px_rgba(29,78,216,0.1)]">
                ✦
            </span>
            <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold tracking-tight text-foreground">Assistente PP7IA</div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                        className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
                            isStreaming
                                ? "border border-blue-600/20 bg-blue-500/10 text-foreground dark:border-blue-400/20 dark:text-blue-200"
                                : "chat-status-chip border border-emerald-600/25 bg-emerald-500/10 dark:border-emerald-400/20",
                        ].join(" ")}
                    >
                        <span className={["h-1.5 w-1.5 rounded-full", isStreaming ? "bg-brand-blue animate-pulse dark:bg-blue-300" : "bg-emerald-500"].join(" ")} />
                        {statusLabel}
                    </span>
                </div>
            </div>
            <button
                type="button"
                onClick={onClose}
                aria-label="Fechar chat"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-text-secondary transition-colors duration-200 hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:bg-background/50"
            >
                <X size={14} />
            </button>
        </div>
    );
}
