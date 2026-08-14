// frontend/presentation/chat/useChat.ts
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Message } from "@/domain/chat/Message";
import type { Citation, ErrorCode } from "@/domain/chat/RagAnswer";
import { sendMessage, type ArticleContext } from "./sseClient";

export interface ChatMessage extends Message {
    citations: Citation[];
    streaming: boolean;
}

export interface ChatError {
    code: ErrorCode;
    message: string;
}

const DEFAULT_GREETING = "Olá! Posso responder perguntas sobre os conteúdos do portal — mini-livros, newsletters, radar de oportunidades e mais. O que quer saber?";
const ARTICLE_GREETING = "Olá! Posso responder perguntas sobre este conteúdo específico ou sobre qualquer outro conteúdo do portal. O que quer saber?";

function greetingFor(articleContext: ArticleContext | undefined): ChatMessage {
    return {
        role: "assistant",
        content: articleContext ? ARTICLE_GREETING : DEFAULT_GREETING,
        citations: [],
        streaming: false,
    };
}

const HISTORY_LIMIT = 6;

export interface UseChatResult {
    messages: ChatMessage[];
    isStreaming: boolean;
    error: ChatError | null;
    isOpen: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
    send: (text: string) => Promise<void>;
    reset: () => void;
}

export function useChat(articleContext?: ArticleContext): UseChatResult {
    const greeting = useMemo(() => greetingFor(articleContext), [articleContext]);
    const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<ChatError | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const toggle = useCallback(() => setIsOpen(o => !o), []);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    const reset = useCallback(() => {
        abortRef.current?.abort();
        setMessages([greeting]);
        setError(null);
        setIsStreaming(false);
    }, [greeting]);

    const send = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setError(null);
        setIsStreaming(true);

        const userMsg: ChatMessage = { role: "user", content: trimmed, citations: [], streaming: false };
        const botMsg: ChatMessage = { role: "assistant", content: "", citations: [], streaming: true };

        // Snapshot prior history for the request (last HISTORY_LIMIT messages)
        const historyForRequest: Message[] = [...messages, userMsg]
            .slice(-HISTORY_LIMIT)
            .map(({ role, content }) => ({ role, content }));

        setMessages(prev => [...prev, userMsg, botMsg]);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            await sendMessage({
                messages: historyForRequest,
                articleContext,
                signal: controller.signal,
                onEvent: (ev) => {
                    if (ev.type === "token") {
                        setMessages(prev => {
                            const next = [...prev];
                            const idx = next.length - 1;
                            next[idx] = { ...next[idx], content: next[idx].content + ev.content };
                            return next;
                        });
                    } else if (ev.type === "done") {
                        setMessages(prev => {
                            const next = [...prev];
                            const idx = next.length - 1;
                            next[idx] = { ...next[idx], citations: ev.citations, streaming: false };
                            return next;
                        });
                    } else if (ev.type === "error") {
                        setError({ code: ev.code, message: ev.message });
                        // Drop the placeholder bot message
                        setMessages(prev => prev.slice(0, -1));
                    }
                },
            });
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                setError({ code: "server_error", message: (err as Error).message });
                setMessages(prev => prev.slice(0, -1));
            }
        } finally {
            setIsStreaming(false);
            abortRef.current = null;
        }
    }, [messages, articleContext]);

    return { messages, isStreaming, error, isOpen, toggle, open, close, send, reset };
}
