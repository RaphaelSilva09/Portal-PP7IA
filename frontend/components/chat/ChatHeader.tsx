"use client";

import { X } from "lucide-react";

interface Props {
    onClose: () => void;
    statusLabel?: string;
}

export function ChatHeader({ onClose, statusLabel = "Online · Gemini" }: Props) {
    return (
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[rgba(99,132,181,0.22)] bg-[rgba(247,250,255,0.85)]">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm shadow-[0_0_20px_rgba(59,130,246,0.22)]">✦</span>
            <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-[#162338] tracking-tight">Assistente PP7IA</div>
                <div className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    {statusLabel}
                </div>
            </div>
            <button
                type="button"
                onClick={onClose}
                aria-label="Fechar chat"
                className="w-7 h-7 rounded-full border border-[rgba(99,132,181,0.22)] text-slate-600 flex items-center justify-center hover:bg-slate-50"
            >
                <X size={14} />
            </button>
        </div>
    );
}
