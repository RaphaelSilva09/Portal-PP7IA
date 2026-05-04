"use client";

import { useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { Disclaimer } from "./Disclaimer";
import type { UseChatResult } from "@/presentation/chat/useChat";

interface Props {
    chat: UseChatResult;
    onClose: () => void;
    onLoginClick: () => void;
    dailyLimit: number;
    isVisible: boolean;
}

export function ChatPanel({ chat, onClose, onLoginClick, dailyLimit, isVisible }: Props) {
    const { isOpen, messages, error, isStreaming, send } = chat;

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    return (
        <div
            role="dialog"
            aria-label="Assistente PP7IA"
            aria-busy={isStreaming}
            className={[
                "fixed z-[60] flex flex-col overflow-hidden text-foreground",
                "rounded-3xl border border-border/80 bg-background/96 backdrop-blur-xl",
                "shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:bg-card dark:shadow-[0_10px_28px_rgba(0,0,0,0.22)]",
                "origin-bottom transition-[opacity,transform] duration-200 ease-out will-change-transform motion-reduce:transform-none motion-reduce:transition-none sm:origin-bottom-right",
                // Mobile: near full-width sheet; Desktop: anchored to bubble
                "left-2 right-2 top-12 bottom-6",
                "sm:left-auto sm:right-6 sm:top-auto sm:bottom-6 sm:w-[400px] sm:h-[580px] sm:max-h-[calc(100vh-4.5rem)]",
                isVisible ? "opacity-100 translate-y-0 scale-100" : "pointer-events-none opacity-0 translate-y-3 scale-[0.985]",
            ].join(" ")}
        >
            <ChatHeader onClose={onClose} isStreaming={isStreaming} />
            <ChatMessages messages={messages} error={error} onLoginClick={onLoginClick} />
            <ChatInput isStreaming={isStreaming} onSend={send} />
            <Disclaimer used={null} limit={dailyLimit} />
        </div>
    );
}
