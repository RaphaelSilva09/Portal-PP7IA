"use client";

import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface Props {
    disabled: boolean;
    onSend: (text: string) => void;
}

export function ChatInput({ disabled, onSend }: Props) {
    const [text, setText] = useState("");

    const submit = () => {
        const trimmed = text.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setText("");
    };

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    };

    return (
        <div className="flex items-end gap-2 p-3 bg-white border-t border-[rgba(99,132,181,0.22)]">
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={disabled}
                placeholder="Faça uma pergunta sobre o livro..."
                className="flex-1 min-h-[36px] max-h-[80px] rounded-[18px] border border-[rgba(99,132,181,0.22)] bg-[#e4ecfb] text-[#162338] text-[13px] px-3.5 py-2 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
            />
            <button
                type="button"
                onClick={submit}
                disabled={disabled}
                aria-label="Enviar mensagem"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.22)]"
            >
                <Send size={16} />
            </button>
        </div>
    );
}
