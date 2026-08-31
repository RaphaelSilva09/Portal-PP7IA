import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import DIContainer from "@/infrastructure/di/container";
import { getUser } from "@/infrastructure/auth/getUser";
import { classifyDeviceCategory } from "@/lib/deviceCategory";
import { sanitizeReadingPrefs } from "@/lib/readingPrefs";
import { sanitizePortalFontScale } from "@/lib/portalTypography";

async function currentDeviceCategory() {
    const requestHeaders = await nextHeaders();
    return classifyDeviceCategory(requestHeaders.get("user-agent"));
}

/**
 * GET /api/user/accessibility-preferences — perfil de tipografia salvo para a
 * categoria de dispositivo (móvel/não-móvel) do leitor logado, derivada do
 * User-Agent da própria requisição.
 */
export async function GET() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "É preciso estar logado" }, { status: 401 });
    }

    const category = await currentDeviceCategory();
    const preference = await DIContainer.getAccessibilityPreferenceRepository().get(user.id, category);
    return NextResponse.json({ preferences: preference?.preferences ?? null });
}

/**
 * POST /api/user/accessibility-preferences — grava o perfil de tipografia do
 * leitor logado para a categoria do dispositivo atual. A categoria vem
 * exclusivamente do User-Agent da requisição (nunca do corpo) — não é
 * possível gravar na categoria de outro tipo de dispositivo a partir do
 * cliente. Todo outro dispositivo do usuário na mesma categoria passa a
 * herdar este valor.
 */
export async function POST(req: NextRequest) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "É preciso estar logado" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (typeof body !== "object" || body === null) {
        return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const candidate = body as Record<string, unknown>;
    const preferences: Record<string, unknown> = {
        readingPrefs: sanitizeReadingPrefs(candidate.readingPrefs),
        portalFontScale: sanitizePortalFontScale(candidate.portalFontScale),
    };

    const category = await currentDeviceCategory();
    await DIContainer.getAccessibilityPreferenceRepository().upsert(user.id, category, preferences);

    return NextResponse.json({ preferences });
}
