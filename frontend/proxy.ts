/**
 * Auth + authorization proxy (Next.js middleware).
 *
 * - /painel-admin: authenticated + role='admin'
 * - /user:         authenticated
 *
 * / and /home are public — no middleware redirect needed.
 * /home redirects to / via the page itself (Next.js redirect()).
 *
 * Backend: better-auth session cookie. Reads via auth.api.getSession.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const ADMIN_ROUTES = "/painel-admin";
const AUTH_ROUTES = "/user";

function redirectToLogin(request: NextRequest): NextResponse {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("authModal", "login");
    return NextResponse.redirect(loginUrl);
}

function redirectToRoot(request: NextRequest): NextResponse {
    return NextResponse.redirect(new URL("/", request.url));
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAdminRoute = pathname.startsWith(ADMIN_ROUTES);
    const isAuthRoute = pathname.startsWith(AUTH_ROUTES);

    if (!isAdminRoute && !isAuthRoute) {
        return NextResponse.next();
    }

    let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;
    try {
        session = await auth.api.getSession({ headers: request.headers });
    } catch (error) {
        console.warn("[proxy] Failed to read auth session", error);
    }

    const user = session?.user ?? null;

    if (!user) {
        return redirectToLogin(request);
    }

    if (isAuthRoute) {
        return NextResponse.next();
    }

    // Admin route — role lives on the better-auth user object as a custom field.
    const role = (user as { role?: string }).role;
    if (role !== "admin") {
        return redirectToRoot(request);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/painel-admin/:path*", "/user/:path*"],
};
