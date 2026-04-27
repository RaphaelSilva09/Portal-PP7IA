"use client";

import { Citations } from "./Citations";
import type { Citation } from "@/domain/chat/RagAnswer";

interface Props {
    role: "user" | "assistant";
    content: string;
    citations: Citation[];
    streaming: boolean;
}

export function MessageBubble({ role, content, citations, streaming }: Props) {
    const isUser = role === "user";
    return (
        <div
            className={[
                "max-w-[88%] text-[13px] leading-relaxed px-3 py-2",
                isUser
                    ? "self-end rounded-[14px_14px_4px_14px] bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_0_20px_rgba(59,130,246,0.22)]"
                    : "self-start rounded-[14px_14px_14px_4px] bg-white border border-[rgba(99,132,181,0.22)] text-[#162338] shadow-[0_1px_2px_rgba(22,35,56,0.04)]",
            ].join(" ")}
        >
            <span style={{ whiteSpace: "pre-wrap" }}>{content}</span>
            {streaming && <span className="inline-block w-[7px] h-[14px] align-text-bottom ml-1 bg-blue-600 animate-pulse" />}
            {!streaming && citations.length > 0 && <Citations citations={citations} />}
        </div>
    );
}
