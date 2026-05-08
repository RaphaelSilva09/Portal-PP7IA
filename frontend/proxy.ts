/**
 * Proxy de Autenticação e Autorização
 *
 * Intercepta rotas protegidas antes de renderizar.
 * - /painel-admin: requer autenticação + admin
 * - /user: requer autenticação
 * - /: landing page (redireciona logados para /home)
 * - /home: homepage autenticada (redireciona anônimos para /)
 *
 * Redirects:
 * - Não autenticado -> /?authModal=login (abre modal de login)
 * - Autenticado não-admin em /painel-admin -> /home
 * - Logado em / -> /home
 * - Anônimo em /home -> /
 *
 * Princípios aplicados:
 * - Defense in Depth: Primeira camada de segurança (proxy)
 * - Fail Secure: Redireciona para home/login se não autorizado
 * - Performance: Evita renderização desnecessária
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseClientKey, getSupabaseUrl } from "@/infrastructure/config/supabase-env";

const ADMIN_ROUTES = "/painel-admin";
const AUTH_ROUTES = "/user";
const HOME_ROUTE = "/home";

function resolveBaseUrl(request: NextRequest): string {
    const candidates = [
        process.env.NEXT_PUBLIC_SITE_URL?.trim(),
        process.env.NEXT_PUBLIC_APP_URL?.trim(),
    ];

    for (const candidate of candidates) {
        if (!candidate) continue;
        try {
            return new URL(candidate).origin;
        } catch {
            continue;
        }
    }

    return new URL(request.url).origin;
}

function redirectToLogin(request: NextRequest): NextResponse {
    const loginUrl = new URL("/", resolveBaseUrl(request));
    loginUrl.searchParams.set("authModal", "login");
    return NextResponse.redirect(loginUrl);
}

function redirectToHome(request: NextRequest): NextResponse {
    return NextResponse.redirect(new URL(HOME_ROUTE, resolveBaseUrl(request)));
}

function copyResponseCookies(source: NextResponse, target: NextResponse): NextResponse {
    source.cookies.getAll().forEach(cookie => {
        target.cookies.set(cookie);
    });

    return target;
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

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        getSupabaseUrl(),
        getSupabaseClientKey(),
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // 1. Verifica usuário autenticado com validação server-side.
    // Em SSR, getUser() é mais confiável que getSession() para proteger rotas.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user && (isAuthRoute || isAdminRoute)) {
        const hasCookie = request.cookies.getAll().some(c => c.name.includes('supabase'));
        console.log('[Auth:proxy] user null on protected route', {
            pathname,
            hasCookie,
            userAgent: request.headers.get('user-agent'),
        });
    }

    // Landing page: logado vai para /home, anônimo renderiza normalmente
    if (isRootRoute) {
        if (user) {
            return copyResponseCookies(
                supabaseResponse,
                NextResponse.redirect(new URL(HOME_ROUTE, resolveBaseUrl(request)))
            );
        }

        return supabaseResponse;
    }

    // Homepage autenticada: anônimo volta para /
    if (isHomeRoute) {
        if (!user) {
            return copyResponseCookies(
                supabaseResponse,
                NextResponse.redirect(new URL("/", resolveBaseUrl(request)))
            );
        }

        return supabaseResponse;
    }

    // 2. Rotas protegidas: requer autenticação
    if (!user) {
        return copyResponseCookies(supabaseResponse, redirectToLogin(request));
    }

    // 3. Para rotas de usuário, autenticação é suficiente
    if (isAuthRoute) {
        return supabaseResponse;
    }

    // 4. Para rotas admin, verifica role no JWT (app_metadata)
    const isAdmin = user.app_metadata?.role === "admin";

    if (!isAdmin) {
        return copyResponseCookies(supabaseResponse, redirectToHome(request));
    }

    return supabaseResponse;
}

export const config = {
    matcher: ["/painel-admin/:path*", "/user/:path*", "/", "/home"],
};
