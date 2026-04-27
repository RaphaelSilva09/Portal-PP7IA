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

    useEffect(() => {
        ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
    }, [messages, error]);

    return (
        <div
            ref={ref}
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gradient-to-b from-[rgba(238,244,255,0.4)] to-[rgba(255,255,255,0.4)]"
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
