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
        <div className="border-t border-border bg-background/97 px-3 py-3 dark:bg-card">
            <div className="flex items-end gap-2 rounded-[22px] border border-border bg-background p-2 transition-[border-color,box-shadow] duration-200 focus-within:border-ink/15 focus-within:shadow-[inset_0_0_0_1px_rgba(17,17,17,0.06)] dark:bg-background/60 dark:focus-within:border-foreground/20">
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-background transition duration-200 hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-foreground dark:text-background"
                >
                    {isStreaming
                        ? <LoaderCircle size={16} className="animate-spin" />
                        : <Send size={16} />}
                </button>
            </div>
        </div>
    );
}
