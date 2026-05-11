/**
 * GET /api/admin/home-recomendacoes-paulo — read row + check HTML existence
 * PUT /api/admin/home-recomendacoes-paulo — multipart upsert
 *   fields: title, description, file? (optional HTML replacement)
 */
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import DIContainer from "@/infrastructure/di/container";
import {
    RECOMENDACOES_PAULO_SLUG,
    RECOMENDACOES_PAULO_STORAGE_BUCKET,
    RECOMENDACOES_PAULO_STORAGE_FOLDER,
    getRecomendacoesPauloSourcePath,
    getRecomendacoesPauloStoragePath,
} from "@/constants/recomendacoesPaulo";

const STORAGE_ROOT = process.env.STORAGE_ROOT ?? "./data";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

interface RecomendacoesRow {
    slug: string;
    title: string | null;
    description: string | null;
    html_path: string | null;
}

async function htmlExists(): Promise<boolean> {
    const dir = path.resolve(
        STORAGE_ROOT,
        RECOMENDACOES_PAULO_STORAGE_BUCKET,
        RECOMENDACOES_PAULO_STORAGE_FOLDER,
    );
    try {
        const entries = await fs.readdir(dir);
        return entries.includes(`${RECOMENDACOES_PAULO_SLUG}.html`);
    } catch {
        return false;
    }
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    try {
        const { rows } = await pool.query<RecomendacoesRow>(
            `SELECT slug, title, description, html_path
             FROM home_recomendacoes_paulo
             WHERE slug = $1
             LIMIT 1`,
            [RECOMENDACOES_PAULO_SLUG],
        );
        const row = rows[0] ?? null;
        const available = await htmlExists();
        return NextResponse.json({ row, available });
    } catch (err) {
        console.error("admin recomendacoes load failed:", err);
        return NextResponse.json({ error: "Falha ao carregar" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const form = await request.formData();
    const title = form.get("title");
    const description = form.get("description");
    const file = form.get("file");

    if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ error: "title é obrigatório" }, { status: 400 });
    }
    if (typeof description !== "string" || !description.trim()) {
        return NextResponse.json({ error: "description é obrigatório" }, { status: 400 });
    }

    try {
        if (file instanceof File && file.size > 0) {
            const storage = DIContainer.getStorageRepository();
            await storage.upload(
                RECOMENDACOES_PAULO_STORAGE_BUCKET,
                getRecomendacoesPauloStoragePath(),
                file,
            );
        }

        await pool.query(
            `INSERT INTO home_recomendacoes_paulo (slug, title, description, html_path)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (slug) DO UPDATE
             SET title = EXCLUDED.title,
                 description = EXCLUDED.description,
                 html_path = EXCLUDED.html_path,
                 updated_at = NOW()`,
            [
                RECOMENDACOES_PAULO_SLUG,
                title.trim(),
                description.trim(),
                getRecomendacoesPauloSourcePath(),
            ],
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("admin recomendacoes upsert failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao salvar" },
            { status: 500 },
        );
    }
}
