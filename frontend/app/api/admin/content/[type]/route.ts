/**
 * POST /api/admin/content/[type]
 *
 * Creates a new content item with optional file uploads (multipart).
 * Backed by CreateContentWithUploadUseCase via DIContainer (server-side).
 */
import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";
import type { ContentType } from "@/domain/entities/ContentItem";
import type { CreateContentWithUploadInput } from "@/application/usecases/CreateContentWithUploadUseCase";

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

export async function POST(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { type } = await params;
    if (!VALID_TYPES.has(type as ContentType)) {
        return NextResponse.json({ error: "Tipo de conteúdo inválido" }, { status: 400 });
    }

    const form = await request.formData();
    const title = strOrUndef(form, "title");
    if (!title) {
        return NextResponse.json({ error: "title é obrigatório" }, { status: 400 });
    }

    const input: CreateContentWithUploadInput = {
        type: type as ContentType,
        title,
        readTime: intOrUndef(form, "readTime"),
        htmlFile: fileFrom(form, "htmlFile"),
        pdfFile: fileFrom(form, "pdfFile"),
        ebookId: intOrUndef(form, "ebookId") ?? null,
        partOrder: intOrUndef(form, "partOrder"),
        tema: strOrUndef(form, "tema"),
        order: intOrUndef(form, "order"),
        subtitle: strOrUndef(form, "subtitle"),
        description: strOrUndef(form, "description"),
        badgeText: strOrUndef(form, "badgeText"),
        coverImageFile: fileFrom(form, "coverImageFile"),
        coverPdfFile: fileFrom(form, "coverPdfFile"),
    };

    try {
        const useCase = DIContainer.getCreateContentWithUploadUseCase();
        const result = await useCase.execute(input);
        return NextResponse.json(result);
    } catch (err) {
        console.error("admin content create failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao criar conteúdo" },
            { status: 500 },
        );
    }
}
