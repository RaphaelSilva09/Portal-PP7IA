import { afterEach, describe, expect, it, vi } from "vitest";

import { generateLocalId } from "@/lib/uid";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("generateLocalId", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("uses crypto.randomUUID when available", () => {
        expect(generateLocalId()).toMatch(UUID_V4);
    });

    it("falls back to getRandomValues when randomUUID is missing (insecure context)", () => {
        const original = globalThis.crypto;
        vi.stubGlobal("crypto", {
            getRandomValues: original.getRandomValues.bind(original),
        });

        const id = generateLocalId();
        expect(id).toMatch(UUID_V4);
    });

    it("still produces unique ids without any crypto API", () => {
        vi.stubGlobal("crypto", undefined);

        const a = generateLocalId();
        const b = generateLocalId();
        expect(a).toBeTruthy();
        expect(a).not.toBe(b);
    });

    it("generates unique values across calls", () => {
        const ids = new Set(Array.from({ length: 100 }, () => generateLocalId()));
        expect(ids.size).toBe(100);
    });
});
