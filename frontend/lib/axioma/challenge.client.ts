import type { AnalyzeAnswer } from "./analyze.client";

export type ChallengeInput = {
    studentName?: string;
    profileTitle?: string;
    profileSummary?: string;
    triageAnswers: AnalyzeAnswer[];
};

export type GeneratedQuestion =
    | {
          id: string;
          type: "choice";
          section: string;
          prompt: string;
          options: { key: string; label: string }[];
          correct: string;
      }
    | {
          id: string;
          type: "open";
          section: string;
          prompt: string;
          placeholder?: string;
      };

export type GenerateChallengeResult = {
    title: string;
    introduction: string;
    level: string;
    questions: GeneratedQuestion[];
};

export async function generateChallenge(input: ChallengeInput): Promise<GenerateChallengeResult> {
    const response = await fetch("/api/axioma/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error ?? `Falha ao gerar prova (${response.status})`);
    }

    return response.json();
}
