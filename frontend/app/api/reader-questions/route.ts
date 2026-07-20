import { NextRequest, NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { getUser } from "@/infrastructure/auth/getUser";

const MAX_QUESTION_LENGTH = 2000;

/** POST /api/reader-questions — só leitores logados podem enviar perguntas. */
export async function POST(req: NextRequest) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "É preciso estar logado para enviar uma pergunta" }, { status: 401 });
    }

    const body = await req.json();
    const question = typeof body?.question === "string" ? body.question.trim() : "";

    if (!question) {
        return NextResponse.json({ error: "Pergunta não pode ficar vazia" }, { status: 400 });
    }
    if (question.length > MAX_QUESTION_LENGTH) {
        return NextResponse.json({ error: `Pergunta muito longa (máx. ${MAX_QUESTION_LENGTH} caracteres)` }, { status: 400 });
    }

    const created = await DIContainer.getReaderQuestionRepository().create(user.id, question);
    return NextResponse.json(created.toObject(), { status: 201 });
}

/** GET /api/reader-questions — leitor logado vê só as próprias perguntas enviadas. */
export async function GET() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const questions = await DIContainer.getReaderQuestionRepository().getByUser(user.id);
    return NextResponse.json(questions.map(q => q.toObject()));
}
