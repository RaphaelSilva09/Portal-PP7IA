/**
 * PUT    /api/admin/content/[type]/[id] — update with optional file replacement
 * DELETE /api/admin/content/[type]/[id] — delete + cleanup files
 */
import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";
import type { ContentType } from "@/domain/entities/ContentItem";
import type { UpdateContentWithFilesInput } from "@/application/usecases/UpdateContentWithFilesUseCase";

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

function fileFrom(form: FormData, key: string): File | undefined {
    const v = form.get(key);
    return v instanceof File && v.size > 0 ? v : undefined;
}

function strOrUndef(form: FormData, key: string): string | undefined {
    const v = form.get(key);
    return typeof v === "string" && v.length > 0 ? v : undefined;
}

function intOrUndef(form: FormData, key: string): number | undefined {
    const v = form.get(key);
    if (typeof v !== "string" || v.length === 0) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
}

function parseId(raw: string): number | null {
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PUT(
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

    const form = await request.formData();
    const input: UpdateContentWithFilesInput = {
        type: type as ContentType,
        id,
        title: strOrUndef(form, "title"),
        readTime: intOrUndef(form, "readTime"),
        htmlFile: fileFrom(form, "htmlFile"),
        pdfFile: fileFrom(form, "pdfFile"),
        tema: strOrUndef(form, "tema"),
        subtitle: strOrUndef(form, "subtitle"),
        description: strOrUndef(form, "description"),
        badgeText: strOrUndef(form, "badgeText"),
        coverImageFile: fileFrom(form, "coverImageFile"),
        coverPdfFile: fileFrom(form, "coverPdfFile"),
    };

    try {
        const useCase = DIContainer.getUpdateContentWithFilesUseCase();
        const result = await useCase.execute(input);
        return NextResponse.json(result);
    } catch (err) {
        console.error("admin content update failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao atualizar conteúdo" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    _request: NextRequest,
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

    try {
        const useCase = DIContainer.getDeleteContentWithFilesUseCase();
        await useCase.execute(type as ContentType, id);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("admin content delete failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao deletar conteúdo" },
            { status: 500 },
        );
    }
}
