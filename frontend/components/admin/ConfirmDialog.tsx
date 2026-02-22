/**
 * ConfirmDialog Component (Admin UI)
 *
 * Modal de confirmação para ações destrutivas.
 * Projetado para idosos 80+: texto grande, botões claros.
 *
 * Princípios de UX:
 * - Font-size mínimo 18px
 * - Botão "Cancelar" como destaque (ação segura)
 * - Botão destrutivo em vermelho
 * - Área de toque generosa (min-height 56px)
 */

"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning";
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    variant = "danger",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    // Bloquear scroll quando modal aberto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // ESC para cancelar
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCancel();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: "bg-red-600 hover:bg-red-700",
        warning: "bg-orange-600 hover:bg-orange-700",
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
        >
            <div
                className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border-glass)] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-[var(--border-glass)]">
                    <h2 id="dialog-title" className="text-2xl font-bold text-[var(--text-primary)] pr-8">
                        {title}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="absolute top-4 right-4 p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)] transition-colors"
                        aria-label="Fechar"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Message */}
                <div className="p-6">
                    <p className="text-lg leading-relaxed text-[var(--text-primary)]">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-[var(--border-glass)]">
                    {/* Cancelar (destaque - ação segura) */}
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-4 text-lg font-semibold rounded-xl bg-[var(--surface-glass)] border-2 border-[var(--brand-blue)] text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white transition-colors min-h-[56px]"
                    >
                        {cancelLabel}
                    </button>

                    {/* Confirmar (destrutivo) */}
                    <button
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                        className={`flex-1 px-6 py-4 text-lg font-semibold rounded-xl text-white transition-colors min-h-[56px] ${variantStyles[variant]}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
