import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { getUser } from "@/infrastructure/auth/getUser";

/** GET /api/reading-trails/[slug] — trilha publicada com os passos hidratados e o progresso do leitor logado. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const user = await getUser();

    const trail = await DIContainer.getReadingTrailUseCase().execute(slug, user?.id ?? null);
    if (!trail) {
        return NextResponse.json({ error: "Trilha não encontrada" }, { status: 404 });
    }

    return NextResponse.json(trail);
}
