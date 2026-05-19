// frontend/infrastructure/chat/GeminiProvider.ts
import { GoogleGenerativeAI, type Content } from "@google/generative-ai";
import type { LLMProvider, LLMStreamInput } from "@/domain/chat/LLMProvider";

const DEFAULT_MODEL = process.env.GEMINI_LLM_MODEL ?? "gemini-2.5-flash";
const MAX_RETRIES = 3;

function isRetryable(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err);
    return msg.includes("503") || msg.includes("Service Unavailable") || msg.includes("overloaded");
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export class GeminiProvider implements LLMProvider {
    private client: GoogleGenerativeAI;
    private modelName: string;

    constructor(apiKey: string, modelName: string = DEFAULT_MODEL) {
        if (!apiKey) throw new Error("GeminiProvider: apiKey required");
        this.client = new GoogleGenerativeAI(apiKey);
        this.modelName = modelName;
    }

    async *streamGenerate(input: LLMStreamInput): AsyncIterable<string> {
        const model = this.client.getGenerativeModel({
            model: this.modelName,
            systemInstruction: input.system,
        });

        const contents: Content[] = [];

        // Inject context as a synthetic user turn so it survives history truncation
        contents.push({
            role: "user",
            parts: [{ text: `Trechos relevantes do livro:\n\n${input.context}` }],
        });
        contents.push({
            role: "model",
            parts: [{ text: "Entendi. Vou usar esses trechos para responder." }],
        });

        for (const m of input.history) {
            contents.push({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
            });
        }

        contents.push({ role: "user", parts: [{ text: input.question }] });

        let lastErr: unknown;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            if (attempt > 0) await sleep(2000 * attempt);
            try {
                const result = await model.generateContentStream({ contents });
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) yield text;
                }
                return;
            } catch (err) {
                lastErr = err;
                if (!isRetryable(err) || attempt === MAX_RETRIES - 1) throw err;
            }
        }
        throw lastErr;
    }
}
