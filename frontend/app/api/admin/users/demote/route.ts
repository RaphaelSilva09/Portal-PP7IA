import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function POST(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { userId } = (await request.json().catch(() => ({}))) as { userId?: string };
    if (!userId) {
        return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
    }

    // Block demoting the last admin to avoid lock-out.
    const { rows: admins } = await pool.query<{ count: string }>(
        `SELECT count(*)::text AS count FROM "user" WHERE role = 'admin'`,
    );
    if (parseInt(admins[0]?.count ?? "0", 10) <= 1) {
        return NextResponse.json(
            { error: "Não é possível remover o último admin." },
            { status: 409 },
        );
    }

    const { rows } = await pool.query<{ id: string; role: string | null }>(
        `UPDATE "user" SET role = 'user', "updatedAt" = NOW() WHERE id = $1 RETURNING id, role`,
        [userId],
    );

    if (rows.length === 0) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: rows[0] });
}
