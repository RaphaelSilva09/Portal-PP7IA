// frontend/infrastructure/chat/GeminiEmbeddingProvider.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { EmbeddingProvider } from "@/domain/chat/EmbeddingProvider";

const DEFAULT_MODEL = "gemini-embedding-001";
const BATCH_SIZE = 100;

export class GeminiEmbeddingProvider implements EmbeddingProvider {
    private client: GoogleGenerativeAI;
    private modelName: string;

    constructor(apiKey: string, modelName: string = DEFAULT_MODEL) {
        if (!apiKey) throw new Error("GeminiEmbeddingProvider: apiKey required");
        this.client = new GoogleGenerativeAI(apiKey);
        this.modelName = modelName;
    }

    async embed(text: string): Promise<number[]> {
        const model = this.client.getGenerativeModel({ model: this.modelName });
        const result = await model.embedContent(text);
        const values = result.embedding?.values;
        if (!values) throw new Error("GeminiEmbeddingProvider: no embedding values returned");
        return values;
    }

    async embedBatch(texts: string[]): Promise<number[][]> {
        if (texts.length === 0) return [];
        const out: number[][] = [];
        for (let i = 0; i < texts.length; i += BATCH_SIZE) {
            const batch = texts.slice(i, i + BATCH_SIZE);
            const model = this.client.getGenerativeModel({ model: this.modelName });
            const result = await model.batchEmbedContents({
                requests: batch.map(text => ({
                    content: { role: "user", parts: [{ text }] },
                })),
            });
            for (const e of result.embeddings) {
                if (!e.values) throw new Error("GeminiEmbeddingProvider: empty embedding in batch");
                out.push(e.values);
            }
        }
        return out;
    }
}
