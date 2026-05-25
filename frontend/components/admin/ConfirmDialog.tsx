"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

export interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning";
    requireCheckboxLabel?: string;
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
    requireCheckboxLabel,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        if (!isOpen) setIsChecked(false);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const confirmDisabled = !!requireCheckboxLabel && !isChecked;

    const variantStyles = {
        danger: "bg-red-500 hover:bg-red-600",
        warning: "bg-orange-500 hover:bg-orange-600",
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-md rounded-t-3xl border border-border bg-background shadow-2xl sm:rounded-3xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-6 pb-0 pt-6">
                    <h2 id="confirm-dialog-title" className="pr-8 font-serif text-2xl tracking-tight text-ink">
                        {title}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Fechar"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="mx-6 mt-4 h-px bg-border" />

                {/* Message */}
                <div className="px-6 py-5">
                    <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
                    {requireCheckboxLabel && (
                        <label className="mt-4 flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => setIsChecked(e.target.checked)}
                                className="mt-0.5 size-4 shrink-0 accent-red-500"
                            />
                            <span className="text-sm leading-relaxed text-muted-foreground">
                                {requireCheckboxLabel}
                            </span>
                        </label>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 pb-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-full border border-border py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/30"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onCancel(); }}
                        disabled={confirmDisabled}
                        className={`flex-1 rounded-full py-3 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${variantStyles[variant]}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
