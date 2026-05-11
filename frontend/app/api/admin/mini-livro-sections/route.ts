/**
 * GET  /api/admin/mini-livro-sections — list all sections
 * POST /api/admin/mini-livro-sections — multipart create + HTML upload
 *   fields: kind, title, description?, index?, file (HTML)
 */
import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import DIContainer from "@/infrastructure/di/container";
import {
    MINI_LIVRO_SECTION_STORAGE_BUCKET,
    getMiniLivroSectionSourcePath,
    getMiniLivroSectionStoragePath,
} from "@/constants/miniLivroSections";

type Kind = "introducao" | "encerramento";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    try {
        const { rows } = await pool.query(`SELECT * FROM mini_livro_sections`);
        return NextResponse.json(rows);
    } catch (err) {
        console.error("admin sections list failed:", err);
        return NextResponse.json({ error: "Falha ao listar seções" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const form = await request.formData();
    const kind = form.get("kind");
    const title = form.get("title");
    const description = form.get("description");
    const file = form.get("file");
    const indexRaw = form.get("index");

    if (kind !== "introducao" && kind !== "encerramento") {
        return NextResponse.json({ error: "kind inválido" }, { status: 400 });
    }
    if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ error: "title é obrigatório" }, { status: 400 });
    }
    if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ error: "file (HTML) é obrigatório" }, { status: 400 });
    }

    const titleClean = title.trim();
    const descriptionClean = typeof description === "string" && description.trim() ? description.trim() : null;
    const indexNum = typeof indexRaw === "string" && indexRaw ? Number(indexRaw) : null;

    const client = await pool.connect();
    let createdId: number | null = null;
    try {
        await client.query("BEGIN");

        const insert = await client.query<{ id: number }>(
            `INSERT INTO mini_livro_sections (kind, title, description, "index")
             VALUES ($1, $2, $3, COALESCE($4, 0))
             RETURNING id`,
            [kind, titleClean, descriptionClean, indexNum],
        );
        createdId = insert.rows[0].id;

        const sourcePath = getMiniLivroSectionSourcePath(kind as Kind, createdId);
        const storagePath = getMiniLivroSectionStoragePath(kind as Kind, createdId);

        const storage = DIContainer.getStorageRepository();
        await storage.upload(MINI_LIVRO_SECTION_STORAGE_BUCKET, storagePath, file);

        await client.query(
            `UPDATE mini_livro_sections SET html_path = $1 WHERE id = $2`,
            [sourcePath, createdId],
        );

        await client.query("COMMIT");

        const { rows } = await client.query(
            `SELECT * FROM mini_livro_sections WHERE id = $1`,
            [createdId],
        );
        return NextResponse.json(rows[0]);
    } catch (err) {
        await client.query("ROLLBACK").catch(() => undefined);
        if (createdId !== null) {
            // Best-effort cleanup of any partially-created row.
            await pool.query(`DELETE FROM mini_livro_sections WHERE id = $1`, [createdId]).catch(() => undefined);
        }
        console.error("admin sections create failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao criar seção" },
            { status: 500 },
        );
    } finally {
        client.release();
    }
}
