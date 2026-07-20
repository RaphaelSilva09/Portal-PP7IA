import { NextRequest, NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { getUser } from "@/infrastructure/auth/getUser";
import { REACTION_TYPES, ReactionType } from "@/domain/entities/ContentReaction";

/** POST /api/reactions — alterna a reação do leitor logado num conteúdo. */
export async function POST(req: NextRequest) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "É preciso estar logado para reagir" }, { status: 401 });
    }

    const body = await req.json();
    const { contentType, contentId, reaction } = body ?? {};

    if (
        typeof contentType !== "string" || !contentType.trim() ||
        typeof contentId !== "string" || !contentId.trim() ||
        !REACTION_TYPES.includes(reaction as ReactionType)
    ) {
        return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const result = await DIContainer.getContentReactionRepository().toggle(user.id, contentType, contentId, reaction as ReactionType);
    const counts = await DIContainer.getContentReactionRepository().getCounts(contentType, contentId);
    return NextResponse.json({ reaction: result, counts });
}
