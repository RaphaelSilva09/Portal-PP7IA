/**
 * POST /api/admin/content/[type]/reorder
 * Body: { orderedIds: number[] }
 *
 * Bulk index update for sortable content types.
 */
import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";
import type { ContentType } from "@/domain/entities/ContentItem";

const VALID_TYPES: ReadonlySet<ContentType> = new Set([
    "newsletter",
    "mini-livro",
    "biblioteca",
    "especial-semana",
    "radar_oportunidades",
    "estudar",
    "ebook",
]);

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ type: string }> },
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { type } = await params;
    if (!VALID_TYPES.has(type as ContentType)) {
        return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const { orderedIds } = (await request.json().catch(() => ({}))) as {
        orderedIds?: unknown;
    };
    if (!Array.isArray(orderedIds) || !orderedIds.every(n => Number.isInteger(n) && n > 0)) {
        return NextResponse.json(
            { error: "orderedIds deve ser array de inteiros positivos" },
            { status: 400 },
        );
    }

    try {
        const repo = DIContainer.getContentRepository();
        await repo.reorderItems(type as ContentType, orderedIds as number[]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("admin content reorder failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao reordenar" },
            { status: 500 },
        );
    }
}
