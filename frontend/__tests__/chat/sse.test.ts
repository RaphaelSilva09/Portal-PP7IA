import { describe, it, expect } from "vitest";
import { encodeSseEvent, parseSseChunk } from "@/lib/chat/sse";

describe("sse helpers", () => {
    it("roundtrips a token event", () => {
        const enc = encodeSseEvent({ type: "token", content: "hello" });
        const text = new TextDecoder().decode(enc);
        const parsed = parseSseChunk(text);
        expect(parsed).toEqual([{ type: "token", content: "hello" }]);
    });

    it("parses multiple events in one chunk", () => {
        const a = new TextDecoder().decode(encodeSseEvent({ type: "token", content: "A" }));
        const b = new TextDecoder().decode(encodeSseEvent({ type: "done", citations: [] }));
        const parsed = parseSseChunk(a + b);
        expect(parsed).toHaveLength(2);
        expect(parsed[1]).toEqual({ type: "done", citations: [] });
    });

    it("ignores malformed events", () => {
        expect(parseSseChunk("data: not-json\n\n")).toEqual([]);
    });
});
