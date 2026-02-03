/**
 * Middleware de Autenticação e Autorização Admin
 *
 * Intercepta rotas /painel-admin antes de renderizar.
 * Verifica sessão e permissão de admin para economizar recursos.
 *
 * Princípios aplicados:
 * - Defense in Depth: Primeira camada de segurança (middleware)
 * - Fail Secure: Redireciona para home se não autorizado
 * - Performance: Evita renderização desnecessária
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // Só intercepta rotas /painel-admin
    if (!request.nextUrl.pathname.startsWith("/painel-admin")) {
        return NextResponse.next();
    }

    const response = NextResponse.next();

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
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 1. Verifica sessão autenticada
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. Verifica se usuário é admin
    const { data: admin } = await supabase
        .from("admin")
        .select("id")
        .eq("id", user.id)
        .single();

    if (!admin) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
}

export const config = {
    matcher: "/painel-admin/:path*",
};
