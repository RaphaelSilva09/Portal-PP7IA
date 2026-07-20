import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AnalyzeAxiomaAnswersUseCase } from '@/application/usecases/AnalyzeAxiomaAnswersUseCase';
import { AxiomaRateLimitExceededError } from '@/domain/axioma/AxiomaError';
import type { IAxiomaAIProvider } from '@/domain/axioma/IAxiomaAIProvider';
import type { IAxiomaUsageRepository } from '@/domain/axioma/IAxiomaUsageRepository';
import type { AnalyzeInput, AnalyzeResult } from '@/domain/axioma/Axioma';

const input: AnalyzeInput = {
    tipo: 'perfil',
    studentName: 'Ana',
    answers: [{ questionId: 'tr1', prompt: 'Pergunta', type: 'choice', answer: 'A' }],
};

const analyzeResult: AnalyzeResult = {
    profileTitle: 'Explorador Curioso',
    summary: 'Resumo',
    strengths: ['Força 1'],
    gaps: ['Lacuna 1'],
    recommendations: [{ title: 'Título', description: 'Descrição' }],
    competencies: [{ label: 'Competência', value: 50 }],
    scoreLabel: 'Score',
    scoreValue: '50/100',
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
const useCase = new AnalyzeAxiomaAnswersUseCase(mockAiProvider, mockUsageRepository, DAILY_LIMIT);

describe('AnalyzeAxiomaAnswersUseCase', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uso abaixo do limite → chama o provider e incrementa o uso', async () => {
        mockUsageRepository.getUsageCount.mockResolvedValue(3);
        mockAiProvider.analyze.mockResolvedValue(analyzeResult);

        const result = await useCase.execute('1.2.3.4', input);

        expect(result).toBe(analyzeResult);
        expect(mockAiProvider.analyze).toHaveBeenCalledWith(input);
        expect(mockUsageRepository.incrementUsage).toHaveBeenCalledWith('1.2.3.4');
    });

    it('uso igual ao limite → lança AxiomaRateLimitExceededError sem chamar o provider', async () => {
        mockUsageRepository.getUsageCount.mockResolvedValue(DAILY_LIMIT);

        await expect(useCase.execute('1.2.3.4', input)).rejects.toBeInstanceOf(AxiomaRateLimitExceededError);
        expect(mockAiProvider.analyze).not.toHaveBeenCalled();
        expect(mockUsageRepository.incrementUsage).not.toHaveBeenCalled();
    });

    it('uso acima do limite → também bloqueia', async () => {
        mockUsageRepository.getUsageCount.mockResolvedValue(DAILY_LIMIT + 5);

        await expect(useCase.execute('1.2.3.4', input)).rejects.toBeInstanceOf(AxiomaRateLimitExceededError);
    });

    it('erro do provider → propaga sem incrementar o uso', async () => {
        mockUsageRepository.getUsageCount.mockResolvedValue(0);
        mockAiProvider.analyze.mockRejectedValue(new Error('Falha na IA'));

        await expect(useCase.execute('1.2.3.4', input)).rejects.toThrow('Falha na IA');
        expect(mockUsageRepository.incrementUsage).not.toHaveBeenCalled();
    });

    it('checagem de uso é feita para o IP correto', async () => {
        mockUsageRepository.getUsageCount.mockResolvedValue(0);
        mockAiProvider.analyze.mockResolvedValue(analyzeResult);

        await useCase.execute('9.9.9.9', input);

        expect(mockUsageRepository.getUsageCount).toHaveBeenCalledWith('9.9.9.9');
    });
});
