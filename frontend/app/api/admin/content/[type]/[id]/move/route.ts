/**
 * POST /api/admin/content/[type]/[id]/move
 *
 * Move um item de conteúdo para outro bloco. Body JSON:
 * { targetType: ContentType, tema?: string, ebookId?: number, partOrder?: number }
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

function parseId(raw: string): number | null {
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
}

interface MoveRequestBody {
    targetType?: string;
    tema?: string;
    ebookId?: number;
    partOrder?: number;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string }> },
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { type, id: idRaw } = await params;
    if (!VALID_TYPES.has(type as ContentType)) {
        return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }
    const id = parseId(idRaw);
    if (id === null) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as MoveRequestBody | null;
    if (!body || !VALID_TYPES.has(body.targetType as ContentType)) {
        return NextResponse.json({ error: "Bloco de destino inválido" }, { status: 400 });
    }

    try {
        const useCase = DIContainer.getMoveContentWithFilesUseCase();
        const result = await useCase.execute({
            sourceType: type as ContentType,
            id,
            targetType: body.targetType as ContentType,
            tema: body.tema,
            ebookId: body.ebookId,
            partOrder: body.partOrder,
        });
        return NextResponse.json(result);
    } catch (err) {
        console.error("admin content move failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao mover conteúdo" },
            { status: 500 },
        );
    }
}
