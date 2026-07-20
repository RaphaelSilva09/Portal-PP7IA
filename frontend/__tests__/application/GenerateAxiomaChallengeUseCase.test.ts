import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GenerateAxiomaChallengeUseCase } from '@/application/usecases/GenerateAxiomaChallengeUseCase';
import { AxiomaEmptyChallengeError, AxiomaRateLimitExceededError } from '@/domain/axioma/AxiomaError';
import type { IAxiomaAIProvider } from '@/domain/axioma/IAxiomaAIProvider';
import type { IAxiomaUsageRepository } from '@/domain/axioma/IAxiomaUsageRepository';
import type { ChallengeInput, GenerateChallengeResult } from '@/domain/axioma/Axioma';

const input: ChallengeInput = {
    studentName: 'Ana',
    profileTitle: 'Explorador Curioso',
    profileSummary: 'Resumo do perfil',
    triageAnswers: [{ questionId: 'tr1', prompt: 'Pergunta', type: 'choice', answer: 'A' }],
};

const challengeResult: GenerateChallengeResult = {
    title: 'Sua prova personalizada',
    introduction: 'Introdução',
    level: 'iniciante',
    questions: [
        { id: 'q1', type: 'choice', section: 'Fundamentos', prompt: 'Pergunta', options: [{ key: 'A', label: 'Opção' }], correct: 'A' },
    ],
};

const mockAiProvider = {
    analyze: vi.fn(),
    generateChallenge: vi.fn(),
} satisfies IAxiomaAIProvider;

const mockUsageRepository = {
    getUsageCount: vi.fn(),
    incrementUsage: vi.fn(),
} satisfies IAxiomaUsageRepository;

const DAILY_LIMIT = 10;
const useCase = new GenerateAxiomaChallengeUseCase(mockAiProvider, mockUsageRepository, DAILY_LIMIT);

describe('GenerateAxiomaChallengeUseCase', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uso abaixo do limite → chama o provider e incrementa o uso', async () => {
        mockUsageRepository.getUsageCount.mockResolvedValue(0);
        mockAiProvider.generateChallenge.mockResolvedValue(challengeResult);

        const result = await useCase.execute('1.2.3.4', input);

        expect(result).toBe(challengeResult);
        expect(mockAiProvider.generateChallenge).toHaveBeenCalledWith(input);
        expect(mockUsageRepository.incrementUsage).toHaveBeenCalledWith('1.2.3.4');
    });

    it('uso igual ao limite → lança AxiomaRateLimitExceededError sem chamar o provider', async () => {
        mockUsageRepository.getUsageCount.mockResolvedValue(DAILY_LIMIT);

        await expect(useCase.execute('1.2.3.4', input)).rejects.toBeInstanceOf(AxiomaRateLimitExceededError);
        expect(mockAiProvider.generateChallenge).not.toHaveBeenCalled();
    });

    it('provider retorna prova sem questões → lança AxiomaEmptyChallengeError sem incrementar uso', async () => {
        mockUsageRepository.getUsageCount.mockResolvedValue(0);
        mockAiProvider.generateChallenge.mockResolvedValue({ ...challengeResult, questions: [] });

        await expect(useCase.execute('1.2.3.4', input)).rejects.toBeInstanceOf(AxiomaEmptyChallengeError);
        expect(mockUsageRepository.incrementUsage).not.toHaveBeenCalled();
    });

    it('provider retorna questions undefined → também lança AxiomaEmptyChallengeError', async () => {
        mockUsageRepository.getUsageCount.mockResolvedValue(0);
        mockAiProvider.generateChallenge.mockResolvedValue({
            ...challengeResult,
            questions: undefined as unknown as GenerateChallengeResult['questions'],
        });

        await expect(useCase.execute('1.2.3.4', input)).rejects.toBeInstanceOf(AxiomaEmptyChallengeError);
    });

    it('erro do provider → propaga sem incrementar o uso', async () => {
        mockUsageRepository.getUsageCount.mockResolvedValue(0);
        mockAiProvider.generateChallenge.mockRejectedValue(new Error('Falha na IA'));

        await expect(useCase.execute('1.2.3.4', input)).rejects.toThrow('Falha na IA');
        expect(mockUsageRepository.incrementUsage).not.toHaveBeenCalled();
    });
});
