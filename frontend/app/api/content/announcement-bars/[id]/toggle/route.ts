import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";

export const runtime = "nodejs";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const { id } = await params;
    const { isActive } = (await req.json().catch(() => ({}))) as { isActive?: boolean };
    if (typeof isActive !== "boolean") {
        return NextResponse.json({ error: "isActive (boolean) é obrigatório" }, { status: 400 });
    }
    const uc = DIContainer.getToggleAnnouncementBarUseCase();
    await uc.execute(id, isActive);
    return NextResponse.json({ success: true });
}
