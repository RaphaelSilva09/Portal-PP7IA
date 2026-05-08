"use client";

import type { ErrorCode } from "@/domain/chat/RagAnswer";

interface Props {
    code: ErrorCode;
    message: string;
    onLoginClick?: () => void;
}

export function ErrorBubble({ code, message, onLoginClick }: Props) {
    return (
        <div className="self-start max-w-[90%] rounded-[22px_22px_22px_8px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[14px] leading-6 shadow-[0_3px_10px_rgba(120,53,15,0.05)] dark:bg-amber-400/10 dark:shadow-none">
            <span className="chat-error-message block font-medium">{message}</span>
            {code === "auth_required" && onLoginClick && (
                <div className="mt-3">
                    <button
                        type="button"
                        onClick={onLoginClick}
                        className="inline-flex items-center rounded-full bg-linear-to-r from-blue-600 to-purple-700 px-4 py-2 text-xs font-semibold text-white shadow-[0_3px_10px_rgba(29,78,216,0.12)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_6px_14px_rgba(29,78,216,0.16)] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/20"
                    >
                        Entrar
                    </button>
                </div>
            )}
        </div>
    );
}
