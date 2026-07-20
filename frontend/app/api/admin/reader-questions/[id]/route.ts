import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";
import type { ReaderQuestionStatus } from "@/domain/entities/ReaderQuestion";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

const VALID_STATUSES: ReaderQuestionStatus[] = ["pending", "published", "archived"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const status = body?.status as ReaderQuestionStatus;
    if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const updated = await DIContainer.getReaderQuestionRepository().updateStatus(id, status);
    if (!updated) {
        return NextResponse.json({ error: "Pergunta não encontrada" }, { status: 404 });
    }
    return NextResponse.json(updated.toObject());
}
