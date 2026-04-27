// frontend/presentation/chat/sseClient.ts
import type { Message } from "@/domain/chat/Message";
import type { SseEvent } from "@/domain/chat/RagAnswer";
import { parseSseChunk } from "@/lib/chat/sse";

export interface SendMessageInput {
    messages: Message[];
    signal?: AbortSignal;
    onEvent: (event: SseEvent) => void;
}

export async function sendMessage({ messages, signal, onEvent }: SendMessageInput): Promise<void> {
    const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
        signal,
    });
    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // Process complete events; keep partial trailing block
        const lastBoundary = buffer.lastIndexOf("\n\n");
        if (lastBoundary === -1) continue;
        const ready = buffer.slice(0, lastBoundary + 2);
        buffer = buffer.slice(lastBoundary + 2);
        for (const ev of parseSseChunk(ready)) onEvent(ev);
    }
    if (buffer.trim().length > 0) {
        for (const ev of parseSseChunk(buffer)) onEvent(ev);
    }
}
