"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useChat } from "@/presentation/chat/useChat";
import { ChatPanel } from "./ChatPanel";
import { useAuthModal } from "@/context/AuthModalContext";

const DAILY_LIMIT = 30;
const TRANSITION_MS = 180;

export default function ChatBubble() {
    const chat = useChat();
    const { openModal } = useAuthModal();
    const [isPanelMounted, setIsPanelMounted] = useState(chat.isOpen);
    const [isPanelActive, setIsPanelActive] = useState(chat.isOpen);
    const [isButtonMounted, setIsButtonMounted] = useState(!chat.isOpen);
    const [isButtonActive, setIsButtonActive] = useState(!chat.isOpen);
    const panelFrameRef = useRef<number | null>(null);
    const buttonFrameRef = useRef<number | null>(null);
    const panelTimeoutRef = useRef<number | null>(null);
    const buttonTimeoutRef = useRef<number | null>(null);

    const clearTransitionHandles = useCallback(() => {
        if (panelFrameRef.current != null) {
            window.cancelAnimationFrame(panelFrameRef.current);
            panelFrameRef.current = null;
        }

        if (buttonFrameRef.current != null) {
            window.cancelAnimationFrame(buttonFrameRef.current);
            buttonFrameRef.current = null;
        }

        if (panelTimeoutRef.current != null) {
            window.clearTimeout(panelTimeoutRef.current);
            panelTimeoutRef.current = null;
        }

        if (buttonTimeoutRef.current != null) {
            window.clearTimeout(buttonTimeoutRef.current);
            buttonTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => clearTransitionHandles();
    }, [clearTransitionHandles]);

    const openChat = useCallback(() => {
        if (chat.isOpen) return;

        clearTransitionHandles();
        setIsButtonActive(false);
        buttonTimeoutRef.current = window.setTimeout(() => {
            setIsButtonMounted(false);
            buttonTimeoutRef.current = null;
        }, TRANSITION_MS);

        setIsPanelMounted(true);
        setIsPanelActive(false);
        panelFrameRef.current = window.requestAnimationFrame(() => {
            setIsPanelActive(true);
            panelFrameRef.current = null;
        });

        chat.open();
    }, [chat, clearTransitionHandles]);

    const closeChat = useCallback(() => {
        if (!chat.isOpen && !isPanelMounted) return;

        clearTransitionHandles();
        setIsButtonMounted(true);
        setIsButtonActive(false);
        buttonFrameRef.current = window.requestAnimationFrame(() => {
            setIsButtonActive(true);
            buttonFrameRef.current = null;
        });

        setIsPanelActive(false);
        panelTimeoutRef.current = window.setTimeout(() => {
            setIsPanelMounted(false);
            panelTimeoutRef.current = null;
        }, TRANSITION_MS);

        chat.close();
    }, [chat, clearTransitionHandles, isPanelMounted]);

    const onLoginClick = () => {
        closeChat();
        openModal({}, "login");
    };

    return (
        <>
            {isButtonMounted && (
                <button
                    type="button"
                    onClick={openChat}
                    aria-label="Abrir chat assistente"
                    aria-pressed={false}
                    className={[
                        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border text-white",
                        "bg-gradient-to-br from-blue-600 to-purple-700",
                        "border-white/75 shadow-[0_18px_42px_rgba(29,78,216,0.28)] dark:border-white/15 dark:shadow-[0_22px_48px_rgba(0,0,0,0.4)]",
                        "transition-all duration-200 ease-out will-change-transform motion-reduce:transform-none motion-reduce:transition-none",
                        "focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/20",
                        "hover:-translate-y-0.5 hover:shadow-[0_24px_52px_rgba(29,78,216,0.34)]",
                        isButtonActive ? "opacity-100 translate-y-0 scale-100" : "pointer-events-none opacity-0 translate-y-2 scale-95",
                    ].join(" ")}
                >
                    <MessageCircle size={24} />
                </button>
            )}
            {isPanelMounted && (
                <ChatPanel
                    chat={chat}
                    onClose={closeChat}
                    onLoginClick={onLoginClick}
                    dailyLimit={DAILY_LIMIT}
                    isVisible={isPanelActive}
                />
            )}
        </>
    );
}
