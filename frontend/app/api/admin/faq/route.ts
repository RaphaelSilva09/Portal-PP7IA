import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const items = await DIContainer.getFaqRepository().getAll();
    return NextResponse.json(items.map(item => item.toObject()));
}

export async function POST(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { question, answer, category, sortOrder } = body ?? {};

    if (typeof question !== "string" || !question.trim() || typeof answer !== "string" || !answer.trim()) {
        return NextResponse.json({ error: "Campos obrigatórios: question, answer" }, { status: 400 });
    }

    const created = await DIContainer.getFaqRepository().create({
        question: question.trim(),
        answer: answer.trim(),
        category: typeof category === "string" ? category.trim() : "",
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
    });

    return NextResponse.json(created.toObject(), { status: 201 });
}
