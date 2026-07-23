import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { getUser } from "@/infrastructure/auth/getUser";

/** GET /api/reactions/[type]/[id] — contagem pública + a reação do usuário logado, se houver. */
export async function GET(_req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
    const { type, id } = await params;
    const repo = DIContainer.getContentReactionRepository();

    const counts = await repo.getCounts(type, id);
    const user = await getUser();
    const userReaction = user ? await repo.getUserReaction(user.id, type, id) : null;

    return NextResponse.json({ counts, userReaction });
}
