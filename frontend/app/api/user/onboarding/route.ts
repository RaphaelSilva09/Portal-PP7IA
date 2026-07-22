import { NextResponse } from "next/server";
import { getUser } from "@/infrastructure/auth/getUser";
import { pool } from "@/lib/db";

/**
 * GET/POST /api/user/onboarding — estado do tour de funcionalidades do
 * portal (distinto do FirstVisitModalContext, que é um nudge de cadastro
 * para visitantes anônimos). GET informa se o usuário já concluiu/pulou o
 * tour ao menos uma vez (gate do disparo automático no primeiro login);
 * POST marca como concluído — chamado tanto ao terminar/pular o tour quanto
 * ao fechar uma repetição manual pelo perfil.
 */
export async function GET() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ completed: true }, { status: 401 });
    }

    const { rows } = await pool.query<{ onboarding_completed_at: Date | null }>(
        `SELECT "onboarding_completed_at" FROM "user" WHERE id = $1`,
        [user.id],
    );
    return NextResponse.json({ completed: rows[0]?.onboarding_completed_at != null });
}

export async function POST() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    await pool.query(`UPDATE "user" SET "onboarding_completed_at" = now() WHERE id = $1`, [user.id]);
    return NextResponse.json({ ok: true });
}
