import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";

/** GET /api/reading-trails — lista as trilhas publicadas para a página /trilhas. */
export async function GET() {
    const summaries = await DIContainer.getReadingTrailRepository().getPublishedSummaries();
    return NextResponse.json({ trails: summaries });
}
