// frontend/infrastructure/chat/providers.ts
import type { LLMProvider } from "@/domain/chat/LLMProvider";
import type { EmbeddingProvider } from "@/domain/chat/EmbeddingProvider";
import { GeminiProvider } from "./GeminiProvider";
import { GroqProvider } from "./GroqProvider";
import { GeminiEmbeddingProvider } from "./GeminiEmbeddingProvider";

export function getLLMProvider(): LLMProvider {
    const which = process.env.LLM_PROVIDER ?? "gemini";
    if (which === "groq") {
        const key = process.env.GROQ_API_KEY;
        if (!key) throw new Error("GROQ_API_KEY required when LLM_PROVIDER=groq");
        return new GroqProvider(key);
    }
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY required");
    const model = process.env.GEMINI_GENERATION_MODEL;
    return new GeminiProvider(key, model);
}

export function getEmbeddingProvider(): EmbeddingProvider {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY required for embeddings");
    const model = process.env.GEMINI_EMBEDDING_MODEL;
    return new GeminiEmbeddingProvider(key, model);
}
