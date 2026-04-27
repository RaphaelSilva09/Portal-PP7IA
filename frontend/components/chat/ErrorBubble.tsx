"use client";

import type { ErrorCode } from "@/domain/chat/RagAnswer";

interface Props {
    code: ErrorCode;
    message: string;
    onLoginClick?: () => void;
}

export function ErrorBubble({ code, message, onLoginClick }: Props) {
    return (
        <div className="self-start max-w-[88%] rounded-[14px_14px_14px_4px] border border-amber-300 bg-amber-50 text-amber-900 text-[13px] px-3 py-2">
            <span>{message}</span>
            {code === "auth_required" && onLoginClick && (
                <div className="mt-2">
                    <button
                        type="button"
                        onClick={onLoginClick}
                        className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                    >
                        Entrar
                    </button>
                </div>
            )}
        </div>
    );
}
