import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

function parseItems(raw: unknown): { contentType: string; contentId: string }[] | null {
    if (!Array.isArray(raw)) return null;
    const items: { contentType: string; contentId: string }[] = [];
    for (const entry of raw) {
        if (
            typeof entry !== "object" || entry === null ||
            typeof (entry as { contentType?: unknown }).contentType !== "string" ||
            typeof (entry as { contentId?: unknown }).contentId !== "string"
        ) {
            return null;
        }
        items.push({ contentType: (entry as { contentType: string }).contentType, contentId: (entry as { contentId: string }).contentId });
    }
    return items;
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const trails = await DIContainer.getReadingTrailRepository().getAllForAdmin();
    return NextResponse.json({ trails });
}

export async function POST(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { slug, title, description, coverImagePath, published, items } = body ?? {};

    const parsedItems = parseItems(items);
    if (
        typeof slug !== "string" || !slug.trim() ||
        typeof title !== "string" || !title.trim() ||
        parsedItems === null
    ) {
        return NextResponse.json({ error: "Campos obrigatórios: slug, title, items" }, { status: 400 });
    }

    try {
        const created = await DIContainer.getReadingTrailRepository().create({
            slug: slug.trim(),
            title: title.trim(),
            description: typeof description === "string" ? description : "",
            coverImagePath: typeof coverImagePath === "string" ? coverImagePath : null,
            published: published === true,
            items: parsedItems,
        });
        return NextResponse.json(created, { status: 201 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao criar trilha";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
