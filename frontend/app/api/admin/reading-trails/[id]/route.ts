import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

function parseId(raw: string): number | null {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function parseItems(raw: unknown): { contentType: string; contentId: string }[] | undefined {
    if (raw === undefined) return undefined;
    if (!Array.isArray(raw)) return [];
    const items: { contentType: string; contentId: string }[] = [];
    for (const entry of raw) {
        if (
            typeof entry !== "object" || entry === null ||
            typeof (entry as { contentType?: unknown }).contentType !== "string" ||
            typeof (entry as { contentId?: unknown }).contentId !== "string"
        ) {
            continue;
        }
        items.push({ contentType: (entry as { contentType: string }).contentType, contentId: (entry as { contentId: string }).contentId });
    }
    return items;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (id === null) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const { slug, title, description, coverImagePath, published, items } = body ?? {};

    try {
        const updated = await DIContainer.getReadingTrailRepository().update(id, {
            slug: typeof slug === "string" ? slug.trim() : undefined,
            title: typeof title === "string" ? title.trim() : undefined,
            description: typeof description === "string" ? description : undefined,
            coverImagePath: coverImagePath === undefined ? undefined : (typeof coverImagePath === "string" ? coverImagePath : null),
            published: typeof published === "boolean" ? published : undefined,
            items: parseItems(items),
        });

        if (!updated) {
            return NextResponse.json({ error: "Trilha não encontrada" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao atualizar trilha";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (id === null) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const deleted = await DIContainer.getReadingTrailRepository().delete(id);
    if (!deleted) {
        return NextResponse.json({ error: "Trilha não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
}
