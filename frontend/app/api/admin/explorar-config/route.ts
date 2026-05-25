import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";
import type { ExplorarConfig } from "@/domain/entities/ExplorarConfig";

export const runtime = "nodejs";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const config = await DIContainer.getExplorarConfigUseCase().execute();
    return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const body = (await req.json()) as ExplorarConfig;
    if (!body?.hero || !Array.isArray(body.blocks)) {
        return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }
    await DIContainer.getUpdateExplorarConfigUseCase().execute(body);
    return NextResponse.json({ ok: true });
}
