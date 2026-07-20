import { NextResponse } from "next/server";
import { z } from "zod";
import { AnalyzeAxiomaAnswersUseCase } from "@/application/usecases/AnalyzeAxiomaAnswersUseCase";
import { AxiomaAIResponseError, AxiomaRateLimitExceededError } from "@/domain/axioma/AxiomaError";
import { getClientIp } from "@/infrastructure/axioma/getClientIp";
import { AXIOMA_DAILY_LIMIT, getAxiomaAIProvider, getAxiomaUsageRepository } from "@/infrastructure/axioma/providers";

export const runtime = "nodejs";

const AnswerSchema = z.object({
    questionId: z.string(),
    prompt: z.string(),
    type: z.enum(["choice", "open"]),
    answer: z.string(),
    optionLabel: z.string().optional(),
});

const InputSchema = z.object({
    tipo: z.enum(["perfil", "tecnico"]),
    studentName: z.string().max(120).optional(),
    technicalScore: z.object({ correct: z.number(), total: z.number() }).optional(),
    answers: z.array(AnswerSchema).min(1).max(50),
});

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    try {
        const ip = getClientIp(request);
        const useCase = new AnalyzeAxiomaAnswersUseCase(
            getAxiomaAIProvider(),
            getAxiomaUsageRepository(),
            AXIOMA_DAILY_LIMIT,
        );

        const result = await useCase.execute(ip, parsed.data);
        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof AxiomaRateLimitExceededError) {
            return NextResponse.json({ error: error.message }, { status: 429 });
        }
        if (error instanceof AxiomaAIResponseError) {
            return NextResponse.json({ error: error.message }, { status: 502 });
        }
        console.error("[axioma/analyze]", error);
        const message = error instanceof Error ? error.message : "Falha na análise da IA";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
