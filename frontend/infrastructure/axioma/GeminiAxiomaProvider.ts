/**
 * GeminiAxiomaProvider (Infrastructure Layer)
 *
 * Implementação de IAxiomaAIProvider usando o Gemini (@google/generative-ai).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalyzeInput, AnalyzeResult, ChallengeInput, GenerateChallengeResult } from "@/domain/axioma/Axioma";
import { AxiomaAIResponseError } from "@/domain/axioma/AxiomaError";
import type { IAxiomaAIProvider } from "@/domain/axioma/IAxiomaAIProvider";
import { buildAnalyzePrompt, buildChallengePrompt } from "./prompts";

const DEFAULT_MODEL = "gemini-2.5-flash";

export class GeminiAxiomaProvider implements IAxiomaAIProvider {
    private readonly client: GoogleGenerativeAI;

    constructor(apiKey: string, private readonly modelName: string = DEFAULT_MODEL) {
        if (!apiKey) throw new Error("GeminiAxiomaProvider: apiKey required");
        this.client = new GoogleGenerativeAI(apiKey);
    }

    async analyze(input: AnalyzeInput): Promise<AnalyzeResult> {
        return this.generateJson(buildAnalyzePrompt(input)) as Promise<AnalyzeResult>;
    }

    async generateChallenge(input: ChallengeInput): Promise<GenerateChallengeResult> {
        return this.generateJson(buildChallengePrompt(input)) as Promise<GenerateChallengeResult>;
    }

    private async generateJson(prompt: string): Promise<unknown> {
        const model = this.client.getGenerativeModel({
            model: this.modelName,
            generationConfig: { responseMimeType: "application/json" },
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (!text) {
            throw new AxiomaAIResponseError("Resposta vazia da IA");
        }

        const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
        try {
            return JSON.parse(cleaned);
        } catch {
            throw new AxiomaAIResponseError("JSON inválido retornado pela IA");
        }
    }
}
