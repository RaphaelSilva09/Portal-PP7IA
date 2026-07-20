export type AnalyzeAnswer = {
    questionId: string;
    prompt: string;
    type: "choice" | "open";
    answer: string;
    optionLabel?: string;
};

export type AnalyzeInput = {
    tipo: "perfil" | "tecnico";
    studentName?: string;
    technicalScore?: { correct: number; total: number };
    answers: AnalyzeAnswer[];
};

export type AnalyzeResult = {
    profileTitle: string;
    summary: string;
    strengths: string[];
    gaps: string[];
    recommendations: { title: string; description: string }[];
    competencies: { label: string; value: number }[];
    scoreLabel: string;
    scoreValue: string;
};

export async function analyzeAnswers(input: AnalyzeInput): Promise<AnalyzeResult> {
    const response = await fetch("/api/axioma/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error ?? `Falha na análise da IA (${response.status})`);
    }

    return response.json();
}
