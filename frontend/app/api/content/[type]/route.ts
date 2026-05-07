import { NextRequest, NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import type { ContentType } from "@/domain/entities/ContentItem";

export const runtime = "nodejs";

const VALID_TYPES = new Set<ContentType>([
    "biblioteca",
    "newsletter",
    "mini-livro",
    "especial-semana",
    "radar_oportunidades",
    "estudar",
]);

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ type: string }> },
) {
    const { type } = await params;
    if (!VALID_TYPES.has(type as ContentType)) {
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    const ct = type as ContentType;

    let payload: unknown;
    switch (ct) {
        case "biblioteca": {
            const uc = DIContainer.getBibliotecaUseCase();
            payload = await uc.execute();
            break;
        }
        case "newsletter": {
            const uc = DIContainer.getNewslettersUseCase();
            payload = await uc.execute();
            break;
        }
        case "mini-livro": {
            const uc = DIContainer.getMiniLivrosUseCase();
            payload = await uc.execute();
            break;
        }
        case "especial-semana": {
            const uc = DIContainer.getEspecialSemanaUseCase();
            payload = await uc.execute();
            break;
        }
        case "radar_oportunidades": {
            const uc = DIContainer.getRadarOportunidadesUseCase();
            payload = await uc.execute();
            break;
        }
        case "estudar": {
            const uc = DIContainer.getEstudarUseCase();
            payload = await uc.execute();
            break;
        }
    }

    const repo = DIContainer.getContentRepository();
    const lastUpdated = await repo.getLastUpdated(ct);

    // Some use cases return arrays (e.g. especial-semana, radar_oportunidades);
    // others return objects with { latest, older, ... }. Wrap arrays under `items`
    // so the JSON shape never depends on JS object/array spread semantics.
    if (Array.isArray(payload)) {
        return NextResponse.json({ items: payload, lastUpdated });
    }
    return NextResponse.json({ ...(payload as object), lastUpdated });
}
