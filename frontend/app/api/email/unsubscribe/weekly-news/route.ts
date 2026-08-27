import { NextRequest, NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribeToken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * RFC 8058 one-click unsubscribe (List-Unsubscribe-Post: List-Unsubscribe=One-Click).
 * Mail providers POST this directly — no login, no cookie, no JS, no
 * confirmation, no redirect. Only ever unsubscribes; never subscribes.
 * Always responds fast and generically: an invalid/tampered token gets a 400
 * with no further detail, a valid token always returns success (including
 * when already unsubscribed) so this stays idempotent and never leaks
 * whether a given user/email exists.
 */
export async function POST(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token");
    const payload = token ? verifyUnsubscribeToken(token) : null;
    if (!payload) {
        return NextResponse.json({ error: "Link inválido" }, { status: 400 });
    }

    const rawBody = await request.text().catch(() => "");
    const params = new URLSearchParams(rawBody);
    if (params.get("List-Unsubscribe") !== "One-Click") {
        return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
    }

    await DIContainer.getCommunicationPreferenceRepository().unsubscribe(
        payload.userId,
        payload.communicationType,
        "email_header",
    );

    return NextResponse.json({ success: true });
}
