import { NextRequest, NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribeToken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Confirms the visible footer-link unsubscribe (POST triggered by the
 * confirmation page's button click — never by the page's own GET/load, so
 * anti-phishing scanners that just fetch the link can't cancel anyone).
 * No login required; only ever unsubscribes, never subscribes/reactivates.
 */
export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    const token = typeof body?.token === "string" ? body.token : null;
    const payload = token ? verifyUnsubscribeToken(token) : null;
    if (!payload) {
        return NextResponse.json({ error: "Link inválido" }, { status: 400 });
    }

    await DIContainer.getCommunicationPreferenceRepository().unsubscribe(
        payload.userId,
        payload.communicationType,
        "email_body",
    );

    return NextResponse.json({ success: true });
}
