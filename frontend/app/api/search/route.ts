import { NextRequest, NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const body = (await req.json().catch(() => ({}))) as { query?: string; filter?: string };
    const query = body.query?.trim() ?? "";
    if (!query) {
        return NextResponse.json({ results: [] });
    }
    const uc = DIContainer.getSearchContentUseCase();
    const results = await uc.execute({ query, filter: (body.filter as never) ?? "all" });
    return NextResponse.json({ results });
}
