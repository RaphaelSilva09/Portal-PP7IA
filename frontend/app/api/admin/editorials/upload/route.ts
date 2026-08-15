/**
 * POST /api/admin/editorials/upload
 *
 * Multipart upload of a single editorial file (HTML or PDF). Admin-gated.
 * Body fields: slug (EditorialSlug), format ("html" | "pdf", default "html"), file (File).
 * Stores at {bucket}/{folder}/{slug}.{html|pdf} on the Railway Volume.
 */
import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";
import {
    EDITORIAL_ITEMS,
    EDITORIAL_STORAGE_BUCKET,
    EDITORIAL_STORAGE_FOLDER,
    getEditorialFileName,
    getEditorialPdfFileName,
    type EditorialSlug,
} from "@/constants/editorials";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

const VALID_SLUGS: ReadonlySet<EditorialSlug> = new Set(EDITORIAL_ITEMS.map(item => item.slug));

export async function POST(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const form = await request.formData();
    const slug = form.get("slug");
    const format = form.get("format");
    const file = form.get("file");

    if (typeof slug !== "string" || !VALID_SLUGS.has(slug as EditorialSlug)) {
        return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
    }
    if (format !== null && format !== "html" && format !== "pdf") {
        return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
    }

    const fileName = format === "pdf"
        ? getEditorialPdfFileName(slug as EditorialSlug)
        : getEditorialFileName(slug as EditorialSlug);

    try {
        const storage = DIContainer.getStorageRepository();
        const result = await storage.upload(
            EDITORIAL_STORAGE_BUCKET,
            `${EDITORIAL_STORAGE_FOLDER}/${fileName}`,
            file,
        );
        return NextResponse.json({ success: true, ...result });
    } catch (err) {
        console.error("Editorial upload failed:", err);
        return NextResponse.json({ error: "Falha ao salvar arquivo" }, { status: 500 });
    }
}
