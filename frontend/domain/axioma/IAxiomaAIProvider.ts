/**
 * IAxiomaAIProvider Interface (Domain Layer)
 *
 * Define o contrato para geração de conteúdo por IA no Axioma.
 *
 * Princípios aplicados:
 * - DIP: Abstração para inversão de dependência
 * - ISP: Interface segregada para as duas operações de IA do Axioma
 */

import type { AnalyzeInput, AnalyzeResult, ChallengeInput, GenerateChallengeResult } from "./Axioma";

export interface IAxiomaAIProvider {
    analyze(input: AnalyzeInput): Promise<AnalyzeResult>;
    generateChallenge(input: ChallengeInput): Promise<GenerateChallengeResult>;
}
