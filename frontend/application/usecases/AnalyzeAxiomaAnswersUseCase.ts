/**
 * AnalyzeAxiomaAnswersUseCase (Application Layer)
 *
 * Gera o relatório de diagnóstico do Axioma a partir das respostas do usuário,
 * respeitando o limite diário de uso por IP.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pelo fluxo de análise
 * - DIP: Depende de abstrações (IAxiomaAIProvider, IAxiomaUsageRepository)
 * - Clean Architecture: Orquestra o domínio sem conhecer infraestrutura
 */

import type { AnalyzeInput, AnalyzeResult } from "@/domain/axioma/Axioma";
import { AxiomaRateLimitExceededError } from "@/domain/axioma/AxiomaError";
import type { IAxiomaAIProvider } from "@/domain/axioma/IAxiomaAIProvider";
import type { IAxiomaUsageRepository } from "@/domain/axioma/IAxiomaUsageRepository";

export class AnalyzeAxiomaAnswersUseCase {
    constructor(
        private readonly aiProvider: IAxiomaAIProvider,
        private readonly usageRepository: IAxiomaUsageRepository,
        private readonly dailyLimit: number,
    ) {}

    /**
     * Executa o caso de uso de análise de respostas.
     *
     * @throws AxiomaRateLimitExceededError se o IP atingiu o limite diário
     * @throws AxiomaAIResponseError se a IA falhar ou retornar dado inválido
     */
    async execute(ip: string, input: AnalyzeInput): Promise<AnalyzeResult> {
        const used = await this.usageRepository.getUsageCount(ip);
        if (used >= this.dailyLimit) {
            throw new AxiomaRateLimitExceededError(this.dailyLimit, "avaliações");
        }

        const result = await this.aiProvider.analyze(input);

        await this.usageRepository.incrementUsage(ip);

        return result;
    }
}
