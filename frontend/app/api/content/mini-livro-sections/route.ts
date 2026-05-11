/**
 * GET /api/content/mini-livro-sections
 *
 * Public read for mini-livro sections. Returns { introducoes, encerramentos, all }
 * matching GetMiniLivroSectionsUseCase output shape so the client hook can
 * consume entity-serialized data.
 */
import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";

export const runtime = "nodejs";

export async function GET() {
    try {
        const result = await DIContainer.getMiniLivroSectionsUseCase().execute();
        return NextResponse.json(result);
    } catch (err) {
        console.error("mini-livro-sections query failed:", err);
        return NextResponse.json({ introducoes: [], encerramentos: [], all: [] });
    }
}
