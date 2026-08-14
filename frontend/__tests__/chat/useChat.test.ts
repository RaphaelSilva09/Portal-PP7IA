import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChat } from "@/presentation/chat/useChat";

function mockSseResponse(events: string[]): Response {
    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            const enc = new TextEncoder();
            for (const e of events) controller.enqueue(enc.encode(e));
            controller.close();
        },
    });
    return new Response(stream);
}

describe("useChat", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("starts with greeting, no error, not streaming", () => {
        const { result } = renderHook(() => useChat());
        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].role).toBe("assistant");
        expect(result.current.isStreaming).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it("send appends user + streaming bot, resolves to filled bot message", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(mockSseResponse([
            'data: {"type":"token","content":"Olá "}\n\n',
            'data: {"type":"token","content":"mundo"}\n\n',
            'data: {"type":"done","citations":[]}\n\n',
        ]));
        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send("oi"); });
        expect(result.current.messages.at(-1)?.content).toBe("Olá mundo");
        expect(result.current.messages.at(-1)?.streaming).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it("sets error and removes placeholder on auth_required", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(mockSseResponse([
            'data: {"type":"error","code":"auth_required","message":"Por favor, faça login para utilizar o chat."}\n\n',
        ]));
        const { result } = renderHook(() => useChat());
        const before = result.current.messages.length;
        await act(async () => { await result.current.send("teste"); });
        expect(result.current.error?.code).toBe("auth_required");
        // user message stays, placeholder bot removed
        expect(result.current.messages.length).toBe(before + 1);
    });

    it("shows a different greeting when opened with an article context", () => {
        const withoutContext = renderHook(() => useChat());
        const withContext = renderHook(() => useChat({ contentType: "mini-livro", contentId: "3" }));
        expect(withContext.result.current.messages[0].content).not.toBe(withoutContext.result.current.messages[0].content);
    });

    it("sends the article context through to the request body", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockSseResponse([
            'data: {"type":"token","content":"ok"}\n\n',
            'data: {"type":"done","citations":[]}\n\n',
        ]));
        const { result } = renderHook(() => useChat({ contentType: "mini-livro", contentId: "3" }));
        await act(async () => { await result.current.send("resuma isso"); });
        const [, init] = fetchSpy.mock.calls[0];
        const body = JSON.parse(init!.body as string);
        expect(body.articleContext).toEqual({ contentType: "mini-livro", contentId: "3" });
    });
});
