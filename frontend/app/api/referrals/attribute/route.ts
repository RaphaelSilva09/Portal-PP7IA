import { NextRequest, NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { getUser } from "@/infrastructure/auth/getUser";

/**
 * POST /api/referrals/attribute — vincula o usuário recém-cadastrado ao
 * convite original (?ref=token capturado antes do cadastro). Chamado
 * fire-and-forget logo após um signup bem-sucedido; falha silenciosamente
 * (não há sessão ativa ainda em fluxos com confirmação de e-mail pendente).
 */
export async function POST(req: NextRequest) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ attributed: false }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token : null;
    if (!token) {
        return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    const attributed = await DIContainer.getReferralRepository().attributeSignup(token, user.id);
    return NextResponse.json({ attributed });
}
