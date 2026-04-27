// frontend/infrastructure/chat/GeminiProvider.ts
import { GoogleGenerativeAI, type Content } from "@google/generative-ai";
import type { LLMProvider, LLMStreamInput } from "@/domain/chat/LLMProvider";

const DEFAULT_MODEL = "gemini-2.5-flash";

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

        const result = await model.generateContentStream({ contents });
        for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) yield text;
        }
    }
}
