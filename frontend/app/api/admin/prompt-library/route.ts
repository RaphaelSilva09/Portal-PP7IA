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
    const items = await DIContainer.getPromptLibraryRepository().getAll();
    return NextResponse.json(items.map(item => item.toObject()));
}

export async function POST(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { aiTool, title, promptBody, useCase, isGated, sortOrder, tags } = body ?? {};

    if (typeof aiTool !== "string" || !aiTool.trim() || typeof title !== "string" || !title.trim() || typeof promptBody !== "string" || !promptBody.trim()) {
        return NextResponse.json({ error: "Campos obrigatórios: aiTool, title, promptBody" }, { status: 400 });
    }

    const created = await DIContainer.getPromptLibraryRepository().create({
        aiTool: aiTool.trim(),
        title: title.trim(),
        promptBody,
        useCase: typeof useCase === "string" ? useCase.trim() : "",
        isGated: isGated !== false,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        tags: Array.isArray(tags) ? tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0) : [],
    });

    return NextResponse.json(created.toObject(), { status: 201 });
}
