import { NextRequest, NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { getUser } from "@/infrastructure/auth/getUser";

/** GET /api/user/preferences/weekly-news — estado atual da inscrição do leitor logado. */
export async function GET() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "É preciso estar logado" }, { status: 401 });
    }

    const preference = await DIContainer.getCommunicationPreferenceRepository().get(user.id, "weekly_news");
    return NextResponse.json({ enabled: preference?.enabled ?? false });
}

/**
 * POST /api/user/preferences/weekly-news — inscreve ou cancela a inscrição do
 * leitor logado em "Novidades da semana". O usuário vem exclusivamente da
 * sessão (nunca do corpo da requisição) — não é possível alterar a
 * preferência de outro usuário.
 */
export async function POST(req: NextRequest) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "É preciso estar logado" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (typeof body?.enabled !== "boolean") {
        return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const repository = DIContainer.getCommunicationPreferenceRepository();
    if (body.enabled) {
        await repository.subscribe(user.id, "weekly_news", "profile");
    } else {
        await repository.unsubscribe(user.id, "weekly_news", "profile");
    }

    return NextResponse.json({ enabled: body.enabled });
}
