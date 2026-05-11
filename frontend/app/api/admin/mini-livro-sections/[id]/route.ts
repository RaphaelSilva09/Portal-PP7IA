/**
 * PATCH  /api/admin/mini-livro-sections/[id] — multipart, updates fields + optional re-upload
 *   fields: title?, description?, file? (replacement HTML)
 * DELETE /api/admin/mini-livro-sections/[id] — deletes row + storage HTML
 */
import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import DIContainer from "@/infrastructure/di/container";
import {
    MINI_LIVRO_SECTION_STORAGE_BUCKET,
    extractStoragePathFromSourcePath,
    getMiniLivroSectionStoragePath,
} from "@/constants/miniLivroSections";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

function parseId(raw: string): number | null {
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
}

interface SectionRow {
    id: number;
    kind: "introducao" | "encerramento";
    html_path: string | null;
}

async function loadSection(id: number): Promise<SectionRow | null> {
    const { rows } = await pool.query<SectionRow>(
        `SELECT id, kind, html_path FROM mini_livro_sections WHERE id = $1`,
        [id],
    );
    return rows[0] ?? null;
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

    const existing = await loadSection(id);
    if (!existing) {
        return NextResponse.json({ error: "Seção não encontrada" }, { status: 404 });
    }

    const form = await request.formData();
    const title = form.get("title");
    const description = form.get("description");
    const file = form.get("file");

    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (typeof title === "string" && title.trim()) {
        updates.push(`title = $${i++}`);
        values.push(title.trim());
    }
    if (typeof description === "string") {
        updates.push(`description = $${i++}`);
        values.push(description.trim() || null);
    }

    try {
        if (file instanceof File && file.size > 0) {
            const storagePath = getMiniLivroSectionStoragePath(existing.kind, id);
            const storage = DIContainer.getStorageRepository();
            await storage.upload(MINI_LIVRO_SECTION_STORAGE_BUCKET, storagePath, file);
        }

        if (updates.length > 0) {
            values.push(id);
            await pool.query(
                `UPDATE mini_livro_sections SET ${updates.join(", ")} WHERE id = $${i}`,
                values,
            );
        }

        const { rows } = await pool.query(
            `SELECT * FROM mini_livro_sections WHERE id = $1`,
            [id],
        );
        return NextResponse.json(rows[0]);
    } catch (err) {
        console.error("admin section update failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao atualizar seção" },
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

    const existing = await loadSection(id);
    if (!existing) {
        return NextResponse.json({ error: "Seção não encontrada" }, { status: 404 });
    }

    try {
        const storagePath = extractStoragePathFromSourcePath(existing.html_path);
        if (storagePath) {
            const storage = DIContainer.getStorageRepository();
            await storage.delete(MINI_LIVRO_SECTION_STORAGE_BUCKET, storagePath);
        }
        await pool.query(`DELETE FROM mini_livro_sections WHERE id = $1`, [id]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("admin section delete failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao deletar seção" },
            { status: 500 },
        );
    }
}
