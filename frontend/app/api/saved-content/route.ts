import { NextRequest, NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { getUser } from "@/infrastructure/auth/getUser";
import { isSavableContentType } from "@/domain/entities/SavedContent";
import { hydrateSavedContent } from "@/lib/savedContent";

/** POST /api/saved-content — alterna o item salvo ("ler depois") do leitor logado. */
export async function POST(req: NextRequest) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "É preciso estar logado para salvar conteúdo" }, { status: 401 });
    }

    const body = await req.json();
    const { contentType, contentId } = body ?? {};

    if (
        typeof contentType !== "string" || !isSavableContentType(contentType) ||
        typeof contentId !== "string" || !contentId.trim()
    ) {
        return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const saved = await DIContainer.getSavedContentRepository().toggle(user.id, contentType, contentId);
    return NextResponse.json({ saved });
}

/** GET /api/saved-content — lista os conteúdos salvos do leitor logado, hidratados com título/link. */
export async function GET() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "É preciso estar logado" }, { status: 401 });
    }

    const entries = await DIContainer.getSavedContentRepository().listByUser(user.id);
    const contentRepo = DIContainer.getContentRepository();
    const items = await hydrateSavedContent(entries, async (contentType, contentId) => {
        if (!isSavableContentType(contentType)) return null;
        const item = await contentRepo.getBySlug(contentType, contentId);
        return item ? { title: item.title } : null;
    });

    return NextResponse.json({ items });
}
