/**
 * Proxy de Autenticação e Autorização
 *
 * Intercepta rotas protegidas antes de renderizar.
 * - /painel-admin: requer autenticação + admin
 * - /user: requer autenticação
 *
 * Redirects:
 * - Não autenticado -> /?authModal=login (abre modal de login)
 * - Autenticado não-admin em /painel-admin -> / (home)
 *
 * Princípios aplicados:
 * - Defense in Depth: Primeira camada de segurança (proxy)
 * - Fail Secure: Redireciona para home/login se não autorizado
 * - Performance: Evita renderização desnecessária
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_ROUTES = "/painel-admin";
const AUTH_ROUTES = "/user";

function redirectToLogin(request: NextRequest): NextResponse {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("authModal", "login");
    return NextResponse.redirect(loginUrl);
}

function redirectToHome(request: NextRequest): NextResponse {
    return NextResponse.redirect(new URL("/", request.url));
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAdminRoute = pathname.startsWith(ADMIN_ROUTES);
    const isAuthRoute = pathname.startsWith(AUTH_ROUTES);

    if (!isAdminRoute && !isAuthRoute) {
        return NextResponse.next();
    }

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // 1. Verifica sessão autenticada
    // OTIMIZAÇÃO: getSession() valida localmente primeiro (JWT cache),
    // evitando requests desnecessários ao servidor em toda navegação
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
        return redirectToLogin(request);
    }

    // 2. Para rotas de usuário, autenticação é suficiente
    if (isAuthRoute) {
        return supabaseResponse;
    }

    // 3. Para rotas admin, verifica role no JWT (app_metadata)
    const isAdmin = session.user.app_metadata?.role === "admin";

    if (!isAdmin) {
        return redirectToHome(request);
    }

    return supabaseResponse;
}

export const config = {
    matcher: ["/painel-admin/:path*", "/user/:path*"],
};
