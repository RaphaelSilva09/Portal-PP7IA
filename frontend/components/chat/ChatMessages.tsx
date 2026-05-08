"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ErrorBubble } from "./ErrorBubble";
import type { ChatMessage, ChatError } from "@/presentation/chat/useChat";

interface Props {
    messages: ChatMessage[];
    error: ChatError | null;
    onLoginClick: () => void;
}

export function ChatMessages({ messages, error, onLoginClick }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const isStreaming = messages[messages.length - 1]?.streaming ?? false;

    useEffect(() => {
        ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: isStreaming ? "auto" : "smooth" });
    }, [messages, error, isStreaming]);

    return (
        <div
            ref={ref}
            role="log"
            aria-live="polite"
            className="flex flex-1 flex-col gap-3.5 overflow-y-auto bg-linear-to-b from-accent/30 via-background/80 to-background px-4 py-4 dark:from-accent/20 dark:via-background dark:to-background"
        >
            {messages.map((m, i) => (
                <MessageBubble
                    key={i}
                    role={m.role}
                    content={m.content}
                    citations={m.citations}
                    streaming={m.streaming}
                />
            ))}
            {error && <ErrorBubble code={error.code} message={error.message} onLoginClick={onLoginClick} />}
        </div>
    );
}
