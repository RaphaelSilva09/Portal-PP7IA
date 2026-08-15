/**
 * DELETE /api/admin/editorials/[slug]
 *
 * Removes the editorial file for the given slug from storage. Admin-gated.
 * Query param: format ("html" | "pdf", default "html").
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { slug } = await params;
    if (!VALID_SLUGS.has(slug as EditorialSlug)) {
        return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
    }

    const format = request.nextUrl.searchParams.get("format") === "pdf" ? "pdf" : "html";
    const fileName = format === "pdf"
        ? getEditorialPdfFileName(slug as EditorialSlug)
        : getEditorialFileName(slug as EditorialSlug);

    try {
        const storage = DIContainer.getStorageRepository();
        await storage.delete(
            EDITORIAL_STORAGE_BUCKET,
            `${EDITORIAL_STORAGE_FOLDER}/${fileName}`,
        );
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Editorial delete failed:", err);
        return NextResponse.json({ error: "Falha ao deletar arquivo" }, { status: 500 });
    }
}
