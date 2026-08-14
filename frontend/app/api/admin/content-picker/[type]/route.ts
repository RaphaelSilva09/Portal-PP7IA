import { NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";
import { isSavableContentType } from "@/domain/entities/SavedContent";
import { deriveSlug } from "@/infrastructure/chat/contentSourceUtils";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

/**
 * GET /api/admin/content-picker/[type] — lista conteúdo já publicado desse
 * tipo (id, título, slug) para o seletor de itens de trilha no admin. O admin
 * escolhe pelo título; o slug (identificador real usado em saved_content e
 * reading_trail_items) é resolvido aqui, nunca digitado manualmente.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ type: string }> }) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { type } = await params;
    if (!isSavableContentType(type)) {
        return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const all = await DIContainer.getContentRepository().getAll(type);
    const items = all
        .filter(item => Boolean(item.htmlPath))
        .map(item => ({ id: item.id, title: item.title, slug: deriveSlug(item.htmlPath!) }))
        .filter(item => item.slug.length > 0);

    return NextResponse.json({ items });
}
