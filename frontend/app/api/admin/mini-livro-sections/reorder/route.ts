/**
 * POST /api/admin/mini-livro-sections/reorder
 * Body: { orderedIds: number[] }
 *
 * Bulk index update — index = position+1 in the supplied order.
 */
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

    const { orderedIds } = (await request.json().catch(() => ({}))) as { orderedIds?: unknown };
    if (!Array.isArray(orderedIds) || !orderedIds.every(n => Number.isInteger(n) && n > 0)) {
        return NextResponse.json(
            { error: "orderedIds deve ser array de inteiros positivos" },
            { status: 400 },
        );
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        for (let i = 0; i < orderedIds.length; i++) {
            await client.query(
                `UPDATE mini_livro_sections SET "index" = $1 WHERE id = $2`,
                [i + 1, orderedIds[i]],
            );
        }
        await client.query("COMMIT");
        return NextResponse.json({ success: true });
    } catch (err) {
        await client.query("ROLLBACK").catch(() => undefined);
        console.error("admin sections reorder failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao reordenar" },
            { status: 500 },
        );
    } finally {
        client.release();
    }
}
