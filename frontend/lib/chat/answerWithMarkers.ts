import type { LLMProvider, LLMStreamInput } from "@/domain/chat/LLMProvider";

export interface AnswerResult {
    answer: string;
    retried: boolean;
    markersOk: boolean;
}

export function hasValidMarker(text: string, max: number): boolean {
    if (max <= 0) return false;
    for (const m of text.matchAll(/\[(\d+)\]/g)) {
        const n = parseInt(m[1], 10);
        if (n >= 1 && n <= max) return true;
    }
    return false;
}

async function drain(provider: LLMProvider, input: LLMStreamInput): Promise<string> {
    let buf = "";
    for await (const tok of provider.streamGenerate(input)) buf += tok;
    return buf;
}

export async function answerWithMarkers(
    provider: LLMProvider,
    input: LLMStreamInput,
    citationCount: number,
): Promise<AnswerResult> {
    const first = await drain(provider, input);
    if (citationCount === 0) {
        return { answer: first, retried: false, markersOk: true };
    }
    if (hasValidMarker(first, citationCount)) {
        return { answer: first, retried: false, markersOk: true };
    }
    const second = await drain(provider, input);
    return {
        answer: second,
        retried: true,
        markersOk: hasValidMarker(second, citationCount),
    };
}
