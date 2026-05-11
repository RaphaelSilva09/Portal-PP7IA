/**
 * GET  /api/admin/portal-news — list all (admin) ordered by display_order
 * POST /api/admin/portal-news — JSON create
 */
import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

interface PortalNewsPayload {
    title?: string;
    description?: string | null;
    icon?: string;
    category?: string;
    accent_color?: string;
    published_at?: string;
    display_order?: number;
    is_active?: boolean;
    link_type?: string | null;
    link_item_id?: number | null;
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    try {
        const { rows } = await pool.query(
            `SELECT * FROM portal_news ORDER BY display_order ASC`,
        );
        return NextResponse.json(rows);
    } catch (err) {
        console.error("admin portal-news list failed:", err);
        return NextResponse.json({ error: "Falha ao listar" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const payload = (await request.json().catch(() => ({}))) as PortalNewsPayload;
    if (!payload.title || !payload.category) {
        return NextResponse.json({ error: "title e category são obrigatórios" }, { status: 400 });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO portal_news (title, description, icon, category, accent_color,
                                      published_at, display_order, is_active,
                                      link_type, link_item_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                payload.title,
                payload.description ?? null,
                payload.icon ?? "📌",
                payload.category,
                payload.accent_color ?? null,
                payload.published_at ?? new Date().toISOString(),
                payload.display_order ?? 0,
                payload.is_active ?? true,
                payload.link_type ?? null,
                payload.link_item_id ?? null,
            ],
        );
        return NextResponse.json(rows[0]);
    } catch (err) {
        console.error("admin portal-news create failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao criar" },
            { status: 500 },
        );
    }
}
