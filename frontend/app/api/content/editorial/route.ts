import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";

export const runtime = "nodejs";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function GET() {
    const uc = DIContainer.getEditorialUseCase();
    const result = await uc.execute();
    return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const { content } = (await req.json().catch(() => ({}))) as { content?: string };
    if (typeof content !== "string") {
        return NextResponse.json({ error: "content (string) é obrigatório" }, { status: 400 });
    }
    const uc = DIContainer.getSaveEditorialUseCase();
    await uc.execute(content);
    return NextResponse.json({ success: true });
}
