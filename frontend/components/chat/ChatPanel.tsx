"use client";

import { useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { Disclaimer } from "./Disclaimer";
import type { UseChatResult } from "@/presentation/chat/useChat";

interface Props {
    chat: UseChatResult;
    onLoginClick: () => void;
    dailyLimit: number;
}

export function ChatPanel({ chat, onLoginClick, dailyLimit }: Props) {
    useEffect(() => {
        if (!chat.isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") chat.close(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [chat.isOpen, chat.close]);

    if (!chat.isOpen) return null;

    return (
        <div
            role="dialog"
            aria-label="Assistente PP7IA"
            className={[
                "fixed z-[60] flex flex-col overflow-hidden",
                "bg-[rgba(255,255,255,0.82)] border border-[rgba(99,132,181,0.22)] backdrop-blur-md",
                "rounded-[20px] shadow-[0_20px_25px_rgba(22,35,56,0.16)]",
                // Mobile: near full-width sheet; Desktop: anchored to bubble
                "left-2 right-2 top-12 bottom-20",
                "sm:left-auto sm:right-6 sm:top-auto sm:bottom-24 sm:w-[380px] sm:h-[480px]",
            ].join(" ")}
        >
            <ChatHeader onClose={chat.close} />
            <ChatMessages messages={chat.messages} error={chat.error} onLoginClick={onLoginClick} />
            <ChatInput disabled={chat.isStreaming} onSend={chat.send} />
            <Disclaimer used={null} limit={dailyLimit} />
        </div>
    );
}
