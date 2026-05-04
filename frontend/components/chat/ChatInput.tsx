"use client";

import { useState, KeyboardEvent } from "react";
import { LoaderCircle, Send } from "lucide-react";

interface Props {
    isStreaming: boolean;
    onSend: (text: string) => void;
}

export function ChatInput({ isStreaming, onSend }: Props) {
    const [text, setText] = useState("");
    const canSend = text.trim().length > 0 && !isStreaming;

    const submit = () => {
        const trimmed = text.trim();
        if (!trimmed || isStreaming) return;
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
        <div className="border-t border-border/80 bg-background/90 px-3 py-3 dark:bg-background/55">
            <div className="flex items-end gap-2.5 rounded-[22px] border border-border/80 bg-card/85 p-2 backdrop-blur-sm transition-[border-color,box-shadow] duration-200 focus-within:border-brand-blue/30 focus-within:shadow-[inset_0_0_0_1px_rgba(29,78,216,0.08)] dark:bg-background/70 dark:focus-within:shadow-[inset_0_0_0_1px_rgba(59,158,255,0.12)]">
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={isStreaming}
                    placeholder={isStreaming ? "Assistente respondendo..." : "Faça uma pergunta sobre o livro..."}
                    className="chat-input-textarea min-h-[44px] max-h-[120px] flex-1 resize-none appearance-none bg-transparent px-2.5 py-2 text-[14px] leading-6 text-foreground outline-none placeholder:text-text-secondary/70 disabled:cursor-not-allowed disabled:text-text-secondary disabled:opacity-90"
                    rows={1}
                />
                <button
                    type="button"
                    onClick={submit}
                    disabled={!canSend}
                    aria-label={isStreaming ? "Assistente respondendo" : "Enviar mensagem"}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-[0_3px_10px_rgba(29,78,216,0.12)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_6px_14px_rgba(29,78,216,0.16)] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-[0_3px_10px_rgba(29,78,216,0.12)]"
                >
                    {isStreaming
                        ? <LoaderCircle size={16} className="animate-spin" />
                        : <Send size={16} />}
                </button>
            </div>
        </div>
    );
}
