/**
 * Axioma Entities (Domain Layer)
 *
 * Tipos do domínio de diagnóstico educacional Axioma IA (bloco "Estudar").
 */

export type AxiomaAnswerType = "choice" | "open";

export interface AxiomaAnswer {
    questionId: string;
    prompt: string;
    type: AxiomaAnswerType;
    answer: string;
    optionLabel?: string;
}

export interface AxiomaTechnicalScore {
    correct: number;
    total: number;
}

export interface AnalyzeInput {
    tipo: "perfil" | "tecnico";
    studentName?: string;
    technicalScore?: AxiomaTechnicalScore;
    answers: AxiomaAnswer[];
}

export interface AxiomaRecommendation {
    title: string;
    description: string;
}

export interface AxiomaCompetency {
    label: string;
    value: number;
}

export interface AnalyzeResult {
    profileTitle: string;
    summary: string;
    strengths: string[];
    gaps: string[];
    recommendations: AxiomaRecommendation[];
    competencies: AxiomaCompetency[];
    scoreLabel: string;
    scoreValue: string;
}

export interface ChallengeInput {
    studentName?: string;
    profileTitle?: string;
    profileSummary?: string;
    triageAnswers: AxiomaAnswer[];
}

export interface AxiomaChoiceOption {
    key: string;
    label: string;
}

export type GeneratedQuestion =
    | {
          id: string;
          type: "choice";
          section: string;
          prompt: string;
          options: AxiomaChoiceOption[];
          correct: string;
      }
    | {
          id: string;
          type: "open";
          section: string;
          prompt: string;
          placeholder?: string;
      };

export interface GenerateChallengeResult {
    title: string;
    introduction: string;
    level: string;
    questions: GeneratedQuestion[];
}
