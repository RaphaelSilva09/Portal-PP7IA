/**
 * Auth + authorization proxy (Next.js middleware).
 *
 * - /painel-admin: authenticated + role='admin'
 * - /user:         authenticated
 * - /:             redirects authenticated users to /home
 * - /home:         authenticated; anonymous → /
 *
 * Backend: better-auth session cookie. Reads via auth.api.getSession.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const ADMIN_ROUTES = "/painel-admin";
const AUTH_ROUTES = "/user";
const HOME_ROUTE = "/home";

function redirectToLogin(request: NextRequest): NextResponse {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("authModal", "login");
    return NextResponse.redirect(loginUrl);
}

function redirectToHome(request: NextRequest): NextResponse {
    return NextResponse.redirect(new URL(HOME_ROUTE, request.url));
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAdminRoute = pathname.startsWith(ADMIN_ROUTES);
    const isAuthRoute = pathname.startsWith(AUTH_ROUTES);
    const isRootRoute = pathname === "/";
    const isHomeRoute = pathname === HOME_ROUTE;

    if (!isAdminRoute && !isAuthRoute && !isRootRoute && !isHomeRoute) {
        return NextResponse.next();
    }

    const session = await auth.api.getSession({ headers: request.headers });
    const user = session?.user ?? null;

    if (isRootRoute) {
        return user ? NextResponse.redirect(new URL(HOME_ROUTE, request.url)) : NextResponse.next();
    }

    if (isHomeRoute) {
        return user ? NextResponse.next() : NextResponse.redirect(new URL("/", request.url));
    }

    if (!user) {
        return redirectToLogin(request);
    }

    if (isAuthRoute) {
        return NextResponse.next();
    }

    // Admin route — role lives on the better-auth user object as a custom field.
    const role = (user as { role?: string }).role;
    if (role !== "admin") {
        return redirectToHome(request);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/painel-admin/:path*", "/user/:path*", "/", "/home"],
};
