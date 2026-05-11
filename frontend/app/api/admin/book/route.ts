/**
 * GET /api/admin/book — read singleton (id=1)
 * PUT /api/admin/book — multipart update + optional file uploads
 *   fields: title, subtitle, description, badgeText, isActive,
 *           coverImageFile?, coverPdfFile?, introPdfFile?, introHtmlFile?
 */
import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import DIContainer from "@/infrastructure/di/container";

const STORAGE_BUCKET = "materiais";
const STORAGE_FOLDER = "mini-livros/livro";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

function strOrNull(form: FormData, key: string): string | null {
    const v = form.get(key);
    return typeof v === "string" && v.trim() ? v.trim() : null;
}

function fileFrom(form: FormData, key: string): File | undefined {
    const v = form.get(key);
    return v instanceof File && v.size > 0 ? v : undefined;
}

function sourcePath(rest: string): string {
    return `${STORAGE_BUCKET}/${rest}`;
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    try {
        const { rows } = await pool.query(
            `SELECT * FROM book ORDER BY id ASC LIMIT 1`,
        );
        return NextResponse.json(rows[0] ?? null);
    } catch (err) {
        console.error("admin book load failed:", err);
        return NextResponse.json({ error: "Falha ao carregar livro" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const form = await request.formData();
    const title = strOrNull(form, "title");
    if (!title) {
        return NextResponse.json({ error: "title é obrigatório" }, { status: 400 });
    }

    const subtitle = strOrNull(form, "subtitle");
    const description = strOrNull(form, "description");
    const badgeText = strOrNull(form, "badgeText");
    const isActiveRaw = form.get("isActive");
    const isActive = isActiveRaw === "true" || isActiveRaw === "1";

    const coverImageFile = fileFrom(form, "coverImageFile");
    const coverPdfFile = fileFrom(form, "coverPdfFile");
    const introPdfFile = fileFrom(form, "introPdfFile");
    const introHtmlFile = fileFrom(form, "introHtmlFile");

    const updates: Record<string, unknown> = {
        title,
        subtitle,
        description,
        badge_text: badgeText,
        is_active: isActive,
    };

    try {
        const storage = DIContainer.getStorageRepository();

        if (coverImageFile) {
            const ext = coverImageFile.name.split(".").pop() ?? "jpg";
            const key = `${STORAGE_FOLDER}/capa.${ext}`;
            await storage.upload(STORAGE_BUCKET, key, coverImageFile);
            updates.cover_image_path = sourcePath(key);
        }
        if (coverPdfFile) {
            const key = `${STORAGE_FOLDER}/capa.pdf`;
            await storage.upload(STORAGE_BUCKET, key, coverPdfFile);
            updates.cover_pdf_path = sourcePath(key);
        }
        if (introPdfFile) {
            const key = `${STORAGE_FOLDER}/introducao-enquanto-e-tempo.pdf`;
            await storage.upload(STORAGE_BUCKET, key, introPdfFile);
            updates.intro_pdf_path = sourcePath(key);
        }
        if (introHtmlFile) {
            const key = `${STORAGE_FOLDER}/introducao-enquanto-e-tempo.html`;
            await storage.upload(STORAGE_BUCKET, key, introHtmlFile);
            updates.intro_html_path = sourcePath(key);
        }

        const cols = Object.keys(updates);
        const setClause = cols.map((c, i) => `"${c}" = $${i + 1}`).join(", ");
        const values = cols.map(c => updates[c]);

        await pool.query(
            `INSERT INTO book (id, ${cols.map(c => `"${c}"`).join(", ")})
             VALUES (1, ${cols.map((_, i) => `$${i + 1}`).join(", ")})
             ON CONFLICT (id) DO UPDATE SET ${setClause}`,
            values,
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("admin book save failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao salvar livro" },
            { status: 500 },
        );
    }
}
