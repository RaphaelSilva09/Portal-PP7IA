import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";
import type { HomepageConfig } from "@/domain/entities/HomepageConfig";

export const runtime = "nodejs";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const config = await DIContainer.getHomepageConfigUseCase().execute();
    return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const body = (await req.json()) as HomepageConfig;
    if (!body?.sections || !Array.isArray(body.sections)) {
        return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }
    await DIContainer.getUpdateHomepageConfigUseCase().execute(body);
    revalidatePath("/");
    return NextResponse.json({ ok: true });
}
