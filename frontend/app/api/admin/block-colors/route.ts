import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";
import { mergeWithDefaults } from "@/domain/entities/BlockColors";
import type { BlockColors } from "@/domain/entities/BlockColors";

export const runtime = "nodejs";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const colors = await DIContainer.getBlockColorsUseCase().execute();
    return NextResponse.json(colors);
}

export async function PUT(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const body = (await req.json()) as Partial<BlockColors>;
    if (!body || typeof body !== "object") {
        return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }
    const colors = mergeWithDefaults(body);
    await DIContainer.getUpdateBlockColorsUseCase().execute(colors);
    return NextResponse.json({ ok: true });
}
