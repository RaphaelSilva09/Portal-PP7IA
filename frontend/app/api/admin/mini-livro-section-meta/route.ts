/**
 * GET /api/admin/mini-livro-section-meta — list rows
 * PUT /api/admin/mini-livro-section-meta — upsert single row
 *   Body: { kind: 'introducao'|'encerramento', title: string, description: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    try {
        const { rows } = await pool.query(
            `SELECT kind, title, description FROM mini_livro_section_meta`,
        );
        return NextResponse.json(rows);
    } catch (err) {
        console.error("admin section-meta list failed:", err);
        return NextResponse.json({ error: "Falha ao listar meta" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { kind, title, description } = (await request.json().catch(() => ({}))) as {
        kind?: unknown;
        title?: unknown;
        description?: unknown;
    };

    if (kind !== "introducao" && kind !== "encerramento") {
        return NextResponse.json({ error: "kind inválido" }, { status: 400 });
    }
    const titleStr = typeof title === "string" ? title.trim() : "";
    const descStr = typeof description === "string" ? description.trim() : "";

    try {
        await pool.query(
            `INSERT INTO mini_livro_section_meta (kind, title, description)
             VALUES ($1, $2, $3)
             ON CONFLICT (kind) DO UPDATE
             SET title = EXCLUDED.title,
                 description = EXCLUDED.description,
                 updated_at = NOW()`,
            [kind, titleStr, descStr],
        );
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("admin section-meta upsert failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao salvar meta" },
            { status: 500 },
        );
    }
}
