"use client";

import { Trash2 } from "lucide-react";

interface InviteRowProps {
    index: number;
    email: string;
    onEmailChange: (value: string) => void;
    onRemove: () => void;
    error?: string;
    canRemove: boolean;
    disabled?: boolean;
}

export default function InviteRow({
    index,
    email,
    onEmailChange,
    onRemove,
    error,
    canRemove,
    disabled = false,
}: InviteRowProps) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex-1">
                <input
                    type="email"
                    placeholder={`email${index + 1}@exemplo.com`}
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    disabled={disabled}
                    className={`w-full px-4 py-3 bg-bg-primary border ${
                        error
                            ? "border-red-500"
                            : "border-border-glass"
                    } rounded-xl text-white placeholder:text-text-secondary
                    focus:outline-none focus:border-brand-blue transition-colors
                    touch-target disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {error && (
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
            </div>
            {canRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    disabled={disabled}
                    className="p-3 text-text-secondary hover:text-red-400
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remover indicação"
                    aria-label="Remover indicação"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
