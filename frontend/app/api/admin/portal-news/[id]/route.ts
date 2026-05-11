/**
 * PATCH  /api/admin/portal-news/[id] — JSON partial update (any subset of columns)
 * DELETE /api/admin/portal-news/[id] — delete row
 */
import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

const ALLOWED_COLUMNS = new Set([
    "title",
    "description",
    "icon",
    "category",
    "accent_color",
    "published_at",
    "display_order",
    "is_active",
    "link_type",
    "link_item_id",
]);

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

function parseId(raw: string): number | null {
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const { id: idRaw } = await params;
    const id = parseId(idRaw);
    if (id === null) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const cols = Object.keys(payload).filter(c => ALLOWED_COLUMNS.has(c));
    if (cols.length === 0) {
        return NextResponse.json({ error: "Nenhum campo válido" }, { status: 400 });
    }

    const setClause = cols.map((c, i) => `"${c}" = $${i + 1}`).join(", ");
    const values: unknown[] = cols.map(c => payload[c]);
    values.push(id);

    try {
        const { rowCount } = await pool.query(
            `UPDATE portal_news SET ${setClause} WHERE id = $${values.length}`,
            values,
        );
        if (rowCount === 0) {
            return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("admin portal-news update failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao atualizar" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const { id: idRaw } = await params;
    const id = parseId(idRaw);
    if (id === null) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    try {
        const { rowCount } = await pool.query(`DELETE FROM portal_news WHERE id = $1`, [id]);
        if (rowCount === 0) {
            return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("admin portal-news delete failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao deletar" },
            { status: 500 },
        );
    }
}
