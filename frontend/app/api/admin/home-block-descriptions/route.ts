/**
 * GET /api/admin/home-block-descriptions — list all
 * PUT /api/admin/home-block-descriptions — JSON upsert single row
 *   Body: { slug: string, description: string }
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
            `SELECT slug, description FROM home_block_descriptions`,
        );
        return NextResponse.json(rows);
    } catch (err) {
        console.error("admin home-block-descriptions list failed:", err);
        return NextResponse.json({ error: "Falha ao listar" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { slug, description } = (await request.json().catch(() => ({}))) as {
        slug?: unknown;
        description?: unknown;
    };
    if (typeof slug !== "string" || !slug.trim()) {
        return NextResponse.json({ error: "slug é obrigatório" }, { status: 400 });
    }
    const desc = typeof description === "string" ? description.trim() : "";

    try {
        await pool.query(
            `INSERT INTO home_block_descriptions (slug, description)
             VALUES ($1, $2)
             ON CONFLICT (slug) DO UPDATE
             SET description = EXCLUDED.description,
                 updated_at = NOW()`,
            [slug.trim(), desc || null],
        );
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("admin home-block-descriptions upsert failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao salvar" },
            { status: 500 },
        );
    }
}
