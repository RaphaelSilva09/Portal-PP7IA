"use client";

import { Citations } from "./Citations";
import { MessageContent } from "./MessageContent";
import type { Citation } from "@/domain/chat/RagAnswer";

interface Props {
    role: "user" | "assistant";
    content: string;
    citations: Citation[];
    streaming: boolean;
}

export function MessageBubble({ role, content, citations, streaming }: Props) {
    const isUser = role === "user";
    const hasContent = content.trim().length > 0;
    const isAssistantStreaming = streaming && !isUser;
    const streamingLabel = hasContent ? "Respondendo" : "Analisando contexto";

    return (
        <div
            className={[
                "max-w-[90%] px-4 py-3 text-[14px] leading-6 break-words transition-[background-color,border-color] duration-300",
                isUser
                    ? "self-end rounded-[22px_22px_8px_22px] border border-ink/10 bg-ink text-background shadow-[0_2px_8px_rgba(17,17,17,0.15)] dark:border-foreground/10 dark:bg-foreground dark:text-background"
                    : [
                        "self-start rounded-[22px_22px_22px_8px] border border-border/80 bg-card/90 text-foreground shadow-[0_2px_8px_rgba(15,23,42,0.05)] dark:bg-background/80 dark:shadow-[0_4px_12px_rgba(0,0,0,0.14)]",
                        isAssistantStreaming && !hasContent ? "min-w-[240px]" : "",
                    ].join(" "),
            ].join(" ")}
        >
            {isAssistantStreaming && (
                <div className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-tight text-text-secondary transition-[opacity,transform] duration-300 motion-reduce:transition-none">
                    <span className="inline-flex h-2 w-2 rounded-full bg-ink animate-pulse-dot dark:bg-foreground/60" />
                    <span>{streamingLabel}</span>
                </div>
            )}

            <div className="relative min-h-[1.75rem]">
                {isAssistantStreaming && (
                    <div
                        className={[
                            "transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
                            hasContent
                                ? "pointer-events-none absolute inset-0 -translate-y-1 opacity-0"
                                : "translate-y-0 opacity-100",
                        ].join(" ")}
                    >
                        <div className="space-y-2 pt-0.5">
                            <div className="chat-loading-line h-2.5 w-20 rounded-full" />
                            <div className="chat-loading-line h-2.5 w-40 rounded-full" />
                            <div className="chat-loading-line h-2.5 w-28 rounded-full" />
                        </div>
                    </div>
                )}

                <div
                    className={[
                        "whitespace-pre-wrap transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
                        isAssistantStreaming && !hasContent ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100",
                    ].join(" ")}
                >
                    <MessageContent content={content} citations={citations} />
                    {isAssistantStreaming && hasContent && <span className="ml-1 inline-block h-[14px] w-[6px] align-text-bottom animate-pulse bg-ink/40 dark:bg-foreground/40" />}
                </div>
            </div>

            {!streaming && citations.length > 0 && <Citations citations={citations} />}
        </div>
    );
}
