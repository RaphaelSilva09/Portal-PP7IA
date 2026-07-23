import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

function parseId(raw: string): number | null {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (id === null) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const { question, answer, category, sortOrder } = body ?? {};

    const updated = await DIContainer.getFaqRepository().update(id, {
        question: typeof question === "string" ? question.trim() : undefined,
        answer: typeof answer === "string" ? answer.trim() : undefined,
        category: typeof category === "string" ? category.trim() : undefined,
        sortOrder: typeof sortOrder === "number" ? sortOrder : undefined,
    });

    if (!updated) {
        return NextResponse.json({ error: "Pergunta não encontrada" }, { status: 404 });
    }
    return NextResponse.json(updated.toObject());
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (id === null) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const deleted = await DIContainer.getFaqRepository().delete(id);
    if (!deleted) {
        return NextResponse.json({ error: "Pergunta não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
}
