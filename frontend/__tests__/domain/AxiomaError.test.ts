import { describe, expect, it } from 'vitest';
import {
    AxiomaAIResponseError,
    AxiomaEmptyChallengeError,
    AxiomaError,
    AxiomaRateLimitExceededError,
} from '@/domain/axioma/AxiomaError';

describe('AxiomaError subtypes', () => {
    it('AxiomaRateLimitExceededError é instanceof AxiomaError e Error', () => {
        const err = new AxiomaRateLimitExceededError(10, 'avaliações');
        expect(err).toBeInstanceOf(AxiomaError);
        expect(err).toBeInstanceOf(Error);
    });

    it('AxiomaRateLimitExceededError formata a mensagem com limite e ação', () => {
        const err = new AxiomaRateLimitExceededError(10, 'avaliações');
        expect(err.message).toBe('Limite diário de 10 avaliações atingido. Tente novamente amanhã.');
    });

    it('AxiomaRateLimitExceededError formata a mensagem para "provas geradas"', () => {
        const err = new AxiomaRateLimitExceededError(5, 'provas geradas');
        expect(err.message).toBe('Limite diário de 5 provas geradas atingido. Tente novamente amanhã.');
    });

    it('AxiomaRateLimitExceededError expõe limit e action', () => {
        const err = new AxiomaRateLimitExceededError(10, 'avaliações');
        expect(err.limit).toBe(10);
        expect(err.action).toBe('avaliações');
    });

    it('AxiomaAIResponseError é instanceof AxiomaError', () => {
        expect(new AxiomaAIResponseError()).toBeInstanceOf(AxiomaError);
    });

    it('AxiomaAIResponseError com mensagem padrão', () => {
        expect(new AxiomaAIResponseError().message).toBe('Falha na resposta da IA');
    });

    it('AxiomaAIResponseError aceita mensagem customizada', () => {
        expect(new AxiomaAIResponseError('JSON inválido retornado pela IA').message).toBe(
            'JSON inválido retornado pela IA',
        );
    });

    it('AxiomaEmptyChallengeError é instanceof AxiomaError', () => {
        expect(new AxiomaEmptyChallengeError()).toBeInstanceOf(AxiomaError);
    });

    it('AxiomaEmptyChallengeError tem mensagem fixa', () => {
        expect(new AxiomaEmptyChallengeError().message).toBe('Prova retornada sem questões');
    });

    it('cada subtipo usa seu próprio nome de classe em .name', () => {
        expect(new AxiomaRateLimitExceededError(10, 'avaliações').name).toBe('AxiomaRateLimitExceededError');
        expect(new AxiomaAIResponseError().name).toBe('AxiomaAIResponseError');
        expect(new AxiomaEmptyChallengeError().name).toBe('AxiomaEmptyChallengeError');
    });
});
