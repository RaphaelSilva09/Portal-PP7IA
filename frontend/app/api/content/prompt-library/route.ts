import { NextRequest, NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { getUser } from "@/infrastructure/auth/getUser";

/**
 * GET /api/content/prompt-library?tool=Claude
 *
 * Leitores anônimos recebem só título + caso de uso (teaser) para prompts
 * marcados como isGated — o corpo completo é benefício de cadastro (PDF 5.4).
 */
export async function GET(req: NextRequest) {
    const tool = req.nextUrl.searchParams.get("tool");
    const user = await getUser();

    const items = await DIContainer.getPromptLibraryRepository().getAll();
    const filtered = tool ? items.filter(item => item.aiTool === tool) : items;

    const payload = filtered.map(item => (item.isGated && !user ? item.toTeaser() : item.toObject()));
    return NextResponse.json(payload);
}
