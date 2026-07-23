import { describe, expect, it } from 'vitest';
import { buildAnalyzePrompt, buildChallengePrompt } from '@/infrastructure/axioma/prompts';
import type { AnalyzeInput, ChallengeInput } from '@/domain/axioma/Axioma';

describe('buildAnalyzePrompt', () => {
    it('inclui o nome do estudante quando informado', () => {
        const input: AnalyzeInput = {
            tipo: 'perfil',
            studentName: 'Maria',
            answers: [{ questionId: 'tr1', prompt: 'Você já usou IA?', type: 'choice', answer: 'A', optionLabel: 'Nunca' }],
        };

        expect(buildAnalyzePrompt(input)).toContain('Nome da pessoa: Maria');
    });

    it('usa "Anônimo" quando o nome não é informado', () => {
        const input: AnalyzeInput = {
            tipo: 'perfil',
            answers: [{ questionId: 'tr1', prompt: 'Pergunta', type: 'open', answer: 'Resposta' }],
        };

        expect(buildAnalyzePrompt(input)).toContain('Nome da pessoa: Anônimo');
    });

    it('inclui a pontuação objetiva apenas para tipo "tecnico" com technicalScore', () => {
        const input: AnalyzeInput = {
            tipo: 'tecnico',
            technicalScore: { correct: 7, total: 10 },
            answers: [{ questionId: 't1', prompt: 'Pergunta', type: 'choice', answer: 'B' }],
        };

        expect(buildAnalyzePrompt(input)).toContain('Pontuação objetiva: 7/10 corretas.');
    });

    it('não inclui pontuação objetiva para tipo "perfil" mesmo com technicalScore', () => {
        const input: AnalyzeInput = {
            tipo: 'perfil',
            technicalScore: { correct: 7, total: 10 },
            answers: [{ questionId: 'tr1', prompt: 'Pergunta', type: 'choice', answer: 'A' }],
        };

        expect(buildAnalyzePrompt(input)).not.toContain('Pontuação objetiva');
    });

    it('formata respostas de múltipla escolha com a alternativa e o rótulo', () => {
        const input: AnalyzeInput = {
            tipo: 'perfil',
            answers: [{ questionId: 'tr1', prompt: 'Pergunta X', type: 'choice', answer: 'B', optionLabel: 'Uso ocasionalmente' }],
        };

        expect(buildAnalyzePrompt(input)).toContain('- [tr1] Pergunta X\n  Resposta: (B) Uso ocasionalmente');
    });

    it('formata respostas abertas de forma diferente das de múltipla escolha', () => {
        const input: AnalyzeInput = {
            tipo: 'perfil',
            answers: [{ questionId: 'tr2', prompt: 'Pergunta aberta', type: 'open', answer: 'Minha resposta' }],
        };

        expect(buildAnalyzePrompt(input)).toContain('- [tr2] Pergunta aberta\n  Resposta aberta: Minha resposta');
    });

    it('pede explicitamente retorno em JSON e segunda pessoa', () => {
        const input: AnalyzeInput = {
            tipo: 'perfil',
            answers: [{ questionId: 'tr1', prompt: 'Pergunta', type: 'choice', answer: 'A' }],
        };

        const prompt = buildAnalyzePrompt(input);
        expect(prompt).toContain('SEGUNDA PESSOA');
        expect(prompt).toContain('JSON válido');
    });
});

describe('buildChallengePrompt', () => {
    it('inclui perfil identificado e resumo quando informados', () => {
        const input: ChallengeInput = {
            studentName: 'João',
            profileTitle: 'Explorador Curioso',
            profileSummary: 'Tem curiosidade mas pouca prática',
            triageAnswers: [{ questionId: 'tr1', prompt: 'Pergunta', type: 'choice', answer: 'A' }],
        };

        const prompt = buildChallengePrompt(input);
        expect(prompt).toContain('Nome: João');
        expect(prompt).toContain('Perfil identificado: Explorador Curioso');
        expect(prompt).toContain('Resumo do perfil: Tem curiosidade mas pouca prática');
    });

    it('usa "n/d" quando perfil e resumo não são informados', () => {
        const input: ChallengeInput = {
            triageAnswers: [{ questionId: 'tr1', prompt: 'Pergunta', type: 'choice', answer: 'A' }],
        };

        const prompt = buildChallengePrompt(input);
        expect(prompt).toContain('Perfil identificado: n/d');
        expect(prompt).toContain('Resumo do perfil: n/d');
    });

    it('especifica exatamente 10 questões e a divisão 7 múltipla escolha + 3 abertas', () => {
        const input: ChallengeInput = {
            triageAnswers: [{ questionId: 'tr1', prompt: 'Pergunta', type: 'choice', answer: 'A' }],
        };

        const prompt = buildChallengePrompt(input);
        expect(prompt).toContain('Exatamente 10 questões');
        expect(prompt).toContain('7 questões de múltipla escolha');
        expect(prompt).toContain('3 questões abertas');
    });
});
