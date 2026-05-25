import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";

export const runtime = "nodejs";

export interface PublicContentStats {
    total: number;
    miniLivros: number;
}

export async function GET() {
    try {
        const repo = DIContainer.getAnalyticsRepository();
        const stats = await repo.getContentStats();

        // total = somente os 7 blocos editoriais (ebooks excluído)
        const total =
            stats.newsletters +
            stats.especialSemana +
            stats.radarOportunidades +
            stats.miniLivros +
            stats.biblioteca +
            stats.estudar;

        const payload: PublicContentStats = {
            total,
            miniLivros: stats.miniLivros,
        };

        return NextResponse.json(payload);
    } catch {
        return NextResponse.json({ total: 0, miniLivros: 0 });
    }
}
