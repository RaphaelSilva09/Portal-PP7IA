/**
 * Admin Users List API Route
 *
 * GET /api/admin/users
 *  ?page=1&pageSize=25&search=foo&date=YYYY-MM-DD
 *
 * Backed by the better-auth "user" table. Admin gate uses better-auth session cookie.
 */
import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

const VALID_PAGE_SIZES = [10, 25, 50];

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

interface UserRow {
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

export async function GET(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const rawPageSize = parseInt(searchParams.get("pageSize") ?? "25", 10);
    const pageSize = VALID_PAGE_SIZES.includes(rawPageSize) ? rawPageSize : 25;
    const search = searchParams.get("search")?.trim() ?? "";
    const dateFilter = searchParams.get("date")?.trim() ?? "";
    const offset = (page - 1) * pageSize;

    const where: string[] = [];
    const params: unknown[] = [];

    if (dateFilter && /^\d{4}-\d{2}-\d{2}$/.test(dateFilter)) {
        // BRT = UTC-3 (Brazil's no-DST timezone). Day window: 03:00 UTC start, 24h.
        const BRT_OFFSET_HOURS = 3;
        const [y, m, d] = dateFilter.split("-").map(Number);
        const startUTC = new Date(Date.UTC(y, m - 1, d, BRT_OFFSET_HOURS, 0, 0, 0));
        const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000 - 1);
        params.push(startUTC.toISOString(), endUTC.toISOString());
        where.push(`u."createdAt" >= $${params.length - 1} AND u."createdAt" <= $${params.length}`);
    } else if (search) {
        const safe = search.replace(/[.,();%]/g, "");
        params.push(`%${safe}%`);
        where.push(`(u.nome ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const orderSql =
        dateFilter && /^\d{4}-\d{2}-\d{2}$/.test(dateFilter)
            ? `ORDER BY u."createdAt" DESC`
            : `ORDER BY u.nome NULLS LAST, u.email`;

    const limitSql = dateFilter && /^\d{4}-\d{2}-\d{2}$/.test(dateFilter)
        ? ""
        : `LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    if (!limitSql.endsWith("")) {
        // never reached; placeholder for symmetry
    }

    const sql = `
        SELECT
            u.id,
            u.email,
            u.nome,
            u.celular,
            u.role,
            u."createdAt"            AS "createdAt",
            u."emailVerified"        AS "emailVerified",
            u.accept_email_updates,
            u.accept_whatsapp_updates,
            (SELECT MAX(s."createdAt") FROM session s WHERE s."userId" = u.id) AS last_sign_in_at
        FROM "user" u
        ${whereSql}
        ${orderSql}
        ${limitSql ? limitSql : ""}
    `;
    const sqlParams = limitSql ? [...params, pageSize, offset] : params;

    const [rowsResult, countResult] = await Promise.all([
        pool.query<UserRow>(sql, sqlParams),
        pool.query<{ count: string }>(`SELECT count(*)::text AS count FROM "user" u ${whereSql}`, params),
    ]);

    const users = rowsResult.rows.map((row) => ({
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

    return NextResponse.json({
        users,
        total: parseInt(countResult.rows[0]?.count ?? "0", 10),
        page,
        pageSize,
    });
}
