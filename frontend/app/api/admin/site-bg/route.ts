import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";
import { isValidBgHex } from "@/domain/entities/SiteBg";
import type { SiteBg } from "@/domain/entities/SiteBg";

export const runtime = "nodejs";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const bg = await DIContainer.getSiteBgUseCase().execute();
    return NextResponse.json(bg);
}

export async function PUT(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const body = (await req.json()) as SiteBg;
    const hexFields: (keyof SiteBg)[] = [
        "light", "dark",
        "bookCardBg", "bookCardTitleColor", "bookCardLabelColor", "bookCardSubtitleColor", "bookCardCtaColor",
        "bookCardProgressBgColor", "bookCardProgressFillColor",
        "newsletterCardBg", "newsletterSidebarNumberColor", "newsletterSidebarLabelColor",
    ];
    if (
        hexFields.some(k => !isValidBgHex((body as unknown as Record<string, string>)[k])) ||
        typeof body?.bookChaptersTotal !== "number" ||
        body.bookChaptersTotal < 1
    ) {
        return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }
    await DIContainer.getUpdateSiteBgUseCase().execute(body);
    return NextResponse.json({ ok: true });
}
