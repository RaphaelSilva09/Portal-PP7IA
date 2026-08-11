import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { getUser } from "@/infrastructure/auth/getUser";

/** GET /api/saved-content/[type]/[id] — se o leitor logado já salvou este conteúdo. */
export async function GET(_req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
    const { type, id } = await params;
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ saved: false });
    }

    const saved = await DIContainer.getSavedContentRepository().isSaved(user.id, type, id);
    return NextResponse.json({ saved });
}
