import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

/** DELETE /api/admin/users/[id] — removes the user; cascades sessions + accounts via FK. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id: userId } = await params;
    if (!userId) {
        return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
    }

    const { rowCount } = await pool.query(`DELETE FROM "user" WHERE id = $1`, [userId]);
    if (rowCount === 0) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
}

/** PATCH /api/admin/users/[id] — updates nome, email, celular. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id: userId } = await params;
    if (!userId) {
        return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as
        | { nome?: string; email?: string; celular?: string }
        | null;
    if (!body) {
        return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    const { nome, email, celular } = body;

    if (nome !== undefined && nome.trim().length < 2) {
        return NextResponse.json({ error: "Nome deve ter pelo menos 2 caracteres" }, { status: 422 });
    }
    if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Email inválido" }, { status: 422 });
    }
    if (celular !== undefined && !/^\d{10,11}$/.test(celular.replace(/\D/g, ""))) {
        return NextResponse.json({ error: "Celular inválido" }, { status: 422 });
    }

    const sets: string[] = [];
    const values: unknown[] = [];

    if (nome !== undefined) {
        values.push(nome.trim());
        sets.push(`nome = $${values.length}`);
        values.push(nome.trim());
        sets.push(`name = $${values.length}`); // keep better-auth's default name in sync
    }
    if (email !== undefined) {
        values.push(email);
        sets.push(`email = $${values.length}`);
    }
    if (celular !== undefined) {
        values.push(celular.replace(/\D/g, ""));
        sets.push(`celular = $${values.length}`);
    }

    if (sets.length === 0) {
        return NextResponse.json({ success: true });
    }

    values.push(userId);
    const { rowCount } = await pool.query(
        `UPDATE "user" SET ${sets.join(", ")}, "updatedAt" = NOW() WHERE id = $${values.length}`,
        values,
    );

    if (rowCount === 0) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
}
