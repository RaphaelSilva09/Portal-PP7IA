import { NextRequest, NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { getUser } from "@/infrastructure/auth/getUser";

/**
 * POST /api/reading-trails/progress — marca este conteúdo como concluído em
 * toda trilha que o contenha. Chamado pelo `ContentViewTracker` ao abrir
 * qualquer página de conteúdo estando logado; é um no-op silencioso quando o
 * conteúdo não pertence a nenhuma trilha.
 */
export async function POST(req: NextRequest) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const body = await req.json();
    const { contentType, contentId } = body ?? {};
    if (typeof contentType !== "string" || !contentType.trim() || typeof contentId !== "string" || !contentId.trim()) {
        return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    await DIContainer.getReadingTrailRepository().markProgress(user.id, contentType, contentId);
    return NextResponse.json({ ok: true });
}
