import { NextResponse } from "next/server";
import { getUser } from "@/infrastructure/auth/getUser";
import { pool } from "@/lib/db";

/**
 * POST /api/user/activity — sinal de "abriu o portal" (distinto de login):
 * disparado uma vez por sessão de aba pelo UserActivityTracker, não a cada
 * clique. Alimenta os filtros de "último acesso" do painel admin.
 */
export async function POST() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    await pool.query(`UPDATE "user" SET "last_seen_at" = now() WHERE id = $1`, [user.id]);
    return NextResponse.json({ ok: true });
}
