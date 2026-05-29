"use client";

import { X } from "lucide-react";

interface Props {
    onClose: () => void;
    isStreaming?: boolean;
}

export function ChatHeader({ onClose, isStreaming = false }: Props) {
    return (
        <div className="flex items-center gap-3 border-b border-border bg-background/97 px-4 py-3 dark:bg-card">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-background font-serif text-sm dark:bg-foreground dark:text-background">
                ✦
            </span>
            <div className="min-w-0 flex-1">
                <div className="font-serif text-sm font-medium text-ink dark:text-foreground">Assistente PP7IA</div>
                <div className="mt-0.5 flex items-center gap-1.5">
                    <span className={[
                        "h-1.5 w-1.5 rounded-full",
                        isStreaming ? "bg-primary animate-pulse" : "bg-emerald-500",
                    ].join(" ")} />
                    <span className="text-[11px] text-muted-foreground">
                        {isStreaming ? "Gerando resposta..." : "Online"}
                    </span>
                </div>
            </div>
            <button
                type="button"
                onClick={onClose}
                aria-label="Fechar chat"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
            >
                <X size={14} />
            </button>
        </div>
    );
}
