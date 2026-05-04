// frontend/lib/chat/sse.ts
import type { SseEvent } from "@/domain/chat/RagAnswer";

const encoder = new TextEncoder();

/** Encode an SseEvent into the SSE wire format (data: <json>\n\n). */
export function encodeSseEvent(event: SseEvent): Uint8Array {
    const line = `data: ${JSON.stringify(event)}\n\n`;
    return encoder.encode(line);
}

/** Build a Response with the right SSE headers around a ReadableStream. */
export function sseResponse(stream: ReadableStream<Uint8Array>): Response {
    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}

/** Parse an SSE wire chunk into zero or more SseEvent objects. */
export function parseSseChunk(text: string): SseEvent[] {
    const out: SseEvent[] = [];
    for (const block of text.split(/\n\n/)) {
        const line = block.split(/\n/).find(l => l.startsWith("data:"));
        if (!line) continue;
        const json = line.slice("data:".length).trim();
        if (!json) continue;
        try {
            out.push(JSON.parse(json) as SseEvent);
        } catch {
            // ignore malformed
        }
    }
    return out;
}
