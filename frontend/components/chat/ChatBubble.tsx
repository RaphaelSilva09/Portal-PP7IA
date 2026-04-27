"use client";

import { MessageCircle } from "lucide-react";
import { useChat } from "@/presentation/chat/useChat";
import { ChatPanel } from "./ChatPanel";
import { useAuthModal } from "@/context/AuthModalContext";

const DAILY_LIMIT = 30;

export default function ChatBubble() {
    const chat = useChat();
    const { openModal } = useAuthModal();

    const onLoginClick = () => {
        chat.close();
        openModal({}, "login");
    };

    return (
        <>
            <button
                type="button"
                onClick={chat.toggle}
                aria-label="Abrir chat assistente"
                className={[
                    "fixed bottom-6 right-6 z-50",
                    "w-14 h-14 rounded-full",
                    "bg-gradient-to-br from-blue-500 to-blue-700 text-white",
                    "border-2 border-white/60",
                    "shadow-[0_20px_25px_rgba(22,35,56,0.16),0_0_20px_rgba(59,130,246,0.22)]",
                    "flex items-center justify-center",
                    "hover:scale-105 transition-transform",
                ].join(" ")}
            >
                <MessageCircle size={24} />
            </button>
            <ChatPanel chat={chat} onLoginClick={onLoginClick} dailyLimit={DAILY_LIMIT} />
        </>
    );
}
