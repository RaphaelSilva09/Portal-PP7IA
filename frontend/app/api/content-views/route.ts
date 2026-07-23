import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { getUser } from "@/infrastructure/auth/getUser";

/**
 * POST /api/content-views — sinal server-side de "primeira visualização de
 * conteúdo" para leitores logados. Antes disso, "visualizou conteúdo" só
 * existia em localStorage (lib/seenContent.ts), sem sinal nenhum no servidor
 * — necessário para o "engajamento do indicado" do PDF 6.4 (não só cadastro).
 */
export async function POST() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    await DIContainer.getReferralRepository().markFirstContentView(user.id);
    return NextResponse.json({ ok: true });
}
