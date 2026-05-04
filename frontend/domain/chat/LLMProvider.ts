// frontend/domain/chat/LLMProvider.ts
import type { Message } from "./Message";

export interface LLMStreamInput {
    system: string;
    context: string;
    history: Message[];
    question: string;
}

export interface LLMProvider {
    /** Yields text token chunks. */
    streamGenerate(input: LLMStreamInput): AsyncIterable<string>;
}
