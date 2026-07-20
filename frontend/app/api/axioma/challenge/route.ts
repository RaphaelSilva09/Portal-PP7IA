import { NextResponse } from "next/server";
import { z } from "zod";
import { GenerateAxiomaChallengeUseCase } from "@/application/usecases/GenerateAxiomaChallengeUseCase";
import {
    AxiomaAIResponseError,
    AxiomaEmptyChallengeError,
    AxiomaRateLimitExceededError,
} from "@/domain/axioma/AxiomaError";
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
    studentName: z.string().max(120).optional(),
    profileTitle: z.string().max(200).optional(),
    profileSummary: z.string().max(2000).optional(),
    triageAnswers: z.array(AnswerSchema).min(1).max(50),
});

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    try {
        const ip = getClientIp(request);
        const useCase = new GenerateAxiomaChallengeUseCase(
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
        if (error instanceof AxiomaEmptyChallengeError || error instanceof AxiomaAIResponseError) {
            return NextResponse.json({ error: error.message }, { status: 502 });
        }
        console.error("[axioma/challenge]", error);
        const message = error instanceof Error ? error.message : "Falha ao gerar prova";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
