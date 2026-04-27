// frontend/infrastructure/chat/GroqProvider.ts
import type { LLMProvider, LLMStreamInput } from "@/domain/chat/LLMProvider";

/**
 * Stub. v1 ships disabled. Selecting LLM_PROVIDER=groq throws at runtime
 * until a real implementation lands.
 */
export class GroqProvider implements LLMProvider {
    constructor(_apiKey: string) {
        throw new Error("GroqProvider not implemented; set LLM_PROVIDER=gemini");
    }
    // eslint-disable-next-line require-yield
    async *streamGenerate(_input: LLMStreamInput): AsyncIterable<string> {
        throw new Error("GroqProvider not implemented");
    }
}
