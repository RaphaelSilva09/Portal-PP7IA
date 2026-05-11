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
    const uc = DIContainer.getAnnouncementBarsUseCase();
    const items = await uc.execute();
    return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const uc = DIContainer.getCreateAnnouncementBarUseCase();
    const result = await uc.execute(body as never);
    return NextResponse.json(result);
}
