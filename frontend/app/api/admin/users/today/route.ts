import { NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

interface Row {
    id: string;
    email: string;
    nome: string | null;
    celular: string | null;
    role: string | null;
    createdAt: Date;
    emailVerified: boolean;
    accept_email_updates: boolean | null;
    accept_whatsapp_updates: boolean | null;
    last_sign_in_at: Date | null;
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // BRT day window (UTC-3, no DST). Today in BRT = [03:00 UTC, +24h).
    const BRT_OFFSET_HOURS = 3;
    const nowBRT = new Date(Date.now() - BRT_OFFSET_HOURS * 60 * 60 * 1000);
    const y = nowBRT.getUTCFullYear();
    const m = nowBRT.getUTCMonth();
    const d = nowBRT.getUTCDate();
    const startUTC = new Date(Date.UTC(y, m, d, BRT_OFFSET_HOURS, 0, 0, 0));
    const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000 - 1);

    const sql = `
        SELECT
            u.id,
            u.email,
            u.nome,
            u.celular,
            u.role,
            u."createdAt"          AS "createdAt",
            u."emailVerified"      AS "emailVerified",
            u.accept_email_updates,
            u.accept_whatsapp_updates,
            (SELECT MAX(s."createdAt") FROM session s WHERE s."userId" = u.id) AS last_sign_in_at
        FROM "user" u
        WHERE u."createdAt" >= $1 AND u."createdAt" <= $2
        ORDER BY u."createdAt" DESC
    `;
    const { rows } = await pool.query<Row>(sql, [startUTC.toISOString(), endUTC.toISOString()]);

    const users = rows.map((row) => ({
        id: row.id,
        email: row.email,
        nome: row.nome ?? "",
        celular: row.celular ?? "",
        isAdmin: row.role === "admin",
        createdAt: row.createdAt,
        lastSignInAt: row.last_sign_in_at,
        acceptEmailUpdates: row.accept_email_updates ?? false,
        acceptWhatsappUpdates: row.accept_whatsapp_updates ?? false,
        emailVerified: row.emailVerified,
    }));

    return NextResponse.json({ users });
}
