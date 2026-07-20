import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AxiomaAIResponseError } from '@/domain/axioma/AxiomaError';
import type { AnalyzeInput, ChallengeInput } from '@/domain/axioma/Axioma';

const generateContentMock = vi.fn();
const getGenerativeModelMock = vi.fn(() => ({ generateContent: generateContentMock }));

vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
        getGenerativeModel: getGenerativeModelMock,
    })),
}));

const { GeminiAxiomaProvider } = await import('@/infrastructure/axioma/GeminiAxiomaProvider');

const analyzeInput: AnalyzeInput = {
    tipo: 'perfil',
    answers: [{ questionId: 'tr1', prompt: 'Pergunta', type: 'choice', answer: 'A' }],
};

const challengeInput: ChallengeInput = {
    triageAnswers: [{ questionId: 'tr1', prompt: 'Pergunta', type: 'choice', answer: 'A' }],
};

function respondWith(text: string) {
    generateContentMock.mockResolvedValue({ response: { text: () => text } });
}

describe('GeminiAxiomaProvider', () => {
    beforeEach(() => {
        generateContentMock.mockReset();
        getGenerativeModelMock.mockClear();
    });

    it('lança erro na construção se apiKey estiver vazia', () => {
        expect(() => new GeminiAxiomaProvider('')).toThrow('GeminiAxiomaProvider: apiKey required');
    });

    it('analyze retorna o JSON parseado da resposta da IA', async () => {
        respondWith('{"profileTitle":"Explorador","summary":"Resumo"}');

        const provider = new GeminiAxiomaProvider('fake-key');
        const result = await provider.analyze(analyzeInput);

        expect(result).toEqual({ profileTitle: 'Explorador', summary: 'Resumo' });
    });

    it('analyze remove cercas de código markdown antes de parsear', async () => {
        respondWith('```json\n{"profileTitle":"Explorador"}\n```');

        const provider = new GeminiAxiomaProvider('fake-key');
        const result = await provider.analyze(analyzeInput);

        expect(result).toEqual({ profileTitle: 'Explorador' });
    });

    it('generateChallenge retorna o JSON parseado da resposta da IA', async () => {
        respondWith('{"title":"Prova","questions":[]}');

        const provider = new GeminiAxiomaProvider('fake-key');
        const result = await provider.generateChallenge(challengeInput);

        expect(result).toEqual({ title: 'Prova', questions: [] });
    });

    it('lança AxiomaAIResponseError quando a resposta da IA vem vazia', async () => {
        respondWith('');

        const provider = new GeminiAxiomaProvider('fake-key');
        await expect(provider.analyze(analyzeInput)).rejects.toBeInstanceOf(AxiomaAIResponseError);
    });

    it('lança AxiomaAIResponseError quando a resposta não é JSON válido', async () => {
        respondWith('isto não é json');

        const provider = new GeminiAxiomaProvider('fake-key');
        await expect(provider.analyze(analyzeInput)).rejects.toBeInstanceOf(AxiomaAIResponseError);
    });

    it('usa o modelo padrão gemini-2.5-flash quando nenhum é informado', async () => {
        respondWith('{}');

        const provider = new GeminiAxiomaProvider('fake-key');
        await provider.analyze(analyzeInput);

        expect(getGenerativeModelMock).toHaveBeenCalledWith(
            expect.objectContaining({ model: 'gemini-2.5-flash' }),
        );
    });

    it('usa o modelo customizado quando informado no construtor', async () => {
        respondWith('{}');

        const provider = new GeminiAxiomaProvider('fake-key', 'gemini-custom-model');
        await provider.generateChallenge(challengeInput);

        expect(getGenerativeModelMock).toHaveBeenCalledWith(
            expect.objectContaining({ model: 'gemini-custom-model' }),
        );
    });

    it('pede responseMimeType application/json ao modelo', async () => {
        respondWith('{}');

        const provider = new GeminiAxiomaProvider('fake-key');
        await provider.analyze(analyzeInput);

        expect(getGenerativeModelMock).toHaveBeenCalledWith(
            expect.objectContaining({ generationConfig: { responseMimeType: 'application/json' } }),
        );
    });
});
