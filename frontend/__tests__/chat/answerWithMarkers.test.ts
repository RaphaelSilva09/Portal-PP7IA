import { describe, it, expect, vi } from "vitest";
import { answerWithMarkers, hasValidMarker } from "@/lib/chat/answerWithMarkers";
import type { LLMProvider, LLMStreamInput } from "@/domain/chat/LLMProvider";

function mockProvider(responses: string[]): LLMProvider {
    let call = 0;
    return {
        async *streamGenerate(_input: LLMStreamInput) {
            const r = responses[call++] ?? "";
            // emit in two chunks to simulate streaming
            yield r.slice(0, Math.floor(r.length / 2));
            yield r.slice(Math.floor(r.length / 2));
        },
    };
}

const input: LLMStreamInput = { system: "s", context: "c", history: [], question: "q" };

describe("hasValidMarker", () => {
    it("returns true when [N] within range exists", () => {
        expect(hasValidMarker("foo [1] bar", 3)).toBe(true);
    });
    it("returns false when no markers", () => {
        expect(hasValidMarker("foo bar", 3)).toBe(false);
    });
    it("returns false when N out of range", () => {
        expect(hasValidMarker("foo [9] bar", 3)).toBe(false);
    });
});

describe("answerWithMarkers", () => {
    it("returns first answer when valid", async () => {
        const provider = mockProvider(["Resposta válida [1]."]);
        const spy = vi.spyOn(provider, "streamGenerate");
        const r = await answerWithMarkers(provider, input, 2);
        expect(r.answer).toBe("Resposta válida [1].");
        expect(r.retried).toBe(false);
        expect(r.markersOk).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("retries once when first response has no markers", async () => {
        const provider = mockProvider(["Sem ref aqui.", "Agora com [1] ref."]);
        const spy = vi.spyOn(provider, "streamGenerate");
        const r = await answerWithMarkers(provider, input, 2);
        expect(r.answer).toBe("Agora com [1] ref.");
        expect(r.retried).toBe(true);
        expect(r.markersOk).toBe(true);
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it("returns the second response even if it also lacks markers", async () => {
        const provider = mockProvider(["Sem ref.", "Ainda sem ref."]);
        const r = await answerWithMarkers(provider, input, 2);
        expect(r.answer).toBe("Ainda sem ref.");
        expect(r.retried).toBe(true);
        expect(r.markersOk).toBe(false);
    });

    it("skips retry entirely when citationCount is 0", async () => {
        const provider = mockProvider(["Sem ref e sem fontes."]);
        const spy = vi.spyOn(provider, "streamGenerate");
        const r = await answerWithMarkers(provider, input, 0);
        expect(r.retried).toBe(false);
        expect(r.markersOk).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
