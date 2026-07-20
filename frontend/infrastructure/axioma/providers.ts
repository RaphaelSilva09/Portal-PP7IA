/**
 * Axioma Providers Factory (Infrastructure Layer)
 *
 * Centraliza a criação das dependências do Axioma (Factory Pattern),
 * lendo configuração de variáveis de ambiente.
 */

import type { IAxiomaAIProvider } from "@/domain/axioma/IAxiomaAIProvider";
import type { IAxiomaUsageRepository } from "@/domain/axioma/IAxiomaUsageRepository";
import { GeminiAxiomaProvider } from "./GeminiAxiomaProvider";
import { AxiomaUsageRepository } from "./AxiomaUsageRepository";

export const AXIOMA_DAILY_LIMIT = parseInt(process.env.AXIOMA_DAILY_LIMIT ?? "10", 10);

export function getAxiomaAIProvider(): IAxiomaAIProvider {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY required");
    return new GeminiAxiomaProvider(apiKey, process.env.GEMINI_GENERATION_MODEL);
}

export function getAxiomaUsageRepository(): IAxiomaUsageRepository {
    return new AxiomaUsageRepository();
}
