/**
 * GenerateAxiomaChallengeUseCase (Application Layer)
 *
 * Gera a prova personalizada do Axioma a partir da triagem do usuário,
 * respeitando o limite diário de uso por IP.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pelo fluxo de geração da prova
 * - DIP: Depende de abstrações (IAxiomaAIProvider, IAxiomaUsageRepository)
 * - Clean Architecture: Orquestra o domínio sem conhecer infraestrutura
 */

import type { ChallengeInput, GenerateChallengeResult } from "@/domain/axioma/Axioma";
import { AxiomaEmptyChallengeError, AxiomaRateLimitExceededError } from "@/domain/axioma/AxiomaError";
import type { IAxiomaAIProvider } from "@/domain/axioma/IAxiomaAIProvider";
import type { IAxiomaUsageRepository } from "@/domain/axioma/IAxiomaUsageRepository";

export class GenerateAxiomaChallengeUseCase {
    constructor(
        private readonly aiProvider: IAxiomaAIProvider,
        private readonly usageRepository: IAxiomaUsageRepository,
        private readonly dailyLimit: number,
    ) {}

    /**
     * Executa o caso de uso de geração de prova personalizada.
     *
     * @throws AxiomaRateLimitExceededError se o IP atingiu o limite diário
     * @throws AxiomaAIResponseError se a IA falhar ou retornar dado inválido
     * @throws AxiomaEmptyChallengeError se a prova gerada não tiver questões
     */
    async execute(ip: string, input: ChallengeInput): Promise<GenerateChallengeResult> {
        const used = await this.usageRepository.getUsageCount(ip);
        if (used >= this.dailyLimit) {
            throw new AxiomaRateLimitExceededError(this.dailyLimit, "provas geradas");
        }

        const result = await this.aiProvider.generateChallenge(input);

        if (!result.questions || result.questions.length === 0) {
            throw new AxiomaEmptyChallengeError();
        }

        await this.usageRepository.incrementUsage(ip);

        return result;
    }
}
