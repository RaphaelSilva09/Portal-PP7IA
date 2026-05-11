/**
 * POST /api/admin/editorials/upload
 *
 * Multipart upload of a single editorial HTML file. Admin-gated.
 * Body fields: slug (EditorialSlug), file (File). Stores at
 * {bucket}/{folder}/{slug}.html on the Railway Volume.
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
    const file = form.get("file");

    if (typeof slug !== "string" || !VALID_SLUGS.has(slug as EditorialSlug)) {
        return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
    }
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
    }

    try {
        const storage = DIContainer.getStorageRepository();
        const result = await storage.upload(
            EDITORIAL_STORAGE_BUCKET,
            `${EDITORIAL_STORAGE_FOLDER}/${getEditorialFileName(slug as EditorialSlug)}`,
            file,
        );
        return NextResponse.json({ success: true, ...result });
    } catch (err) {
        console.error("Editorial upload failed:", err);
        return NextResponse.json({ error: "Falha ao salvar arquivo" }, { status: 500 });
    }
}
