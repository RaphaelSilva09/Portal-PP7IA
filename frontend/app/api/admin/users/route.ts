/**
 * Admin Users List API Route (Edge Function)
 *
 * GET /api/admin/users - Lista usuários com paginação server-side
 *
 * Query params:
 * - page: número da página (default 1)
 * - pageSize: usuários por página (default 25, opções: 10 | 25 | 50)
 * - search: busca por nome ou email (opcional)
 *
 * Segurança:
 * - Valida que requisição vem de admin autenticado via Bearer token
 * - Usa service_role key para listar auth.users (isAdmin real)
 * - Retorna apenas os campos necessários (sem select *)
 *
 * Princípios aplicados:
 * - Least Privilege: Operações privilegiadas isoladas em API route
 * - Fail Secure: Retorna 403/401 em caso de não autorizado
 * - SRP: Responsável apenas por listar usuários paginados
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const getServiceRoleClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Variáveis de ambiente Supabase não configuradas");
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};

async function verifyAdminFromRequest(request: NextRequest): Promise<boolean> {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
        console.warn("[admin-auth] missing Authorization header");
        return false;
    }

    const token = authHeader.replace("Bearer ", "");

    let supabase: ReturnType<typeof getServiceRoleClient>;
    try {
        supabase = getServiceRoleClient();
    } catch (err) {
        console.error("[admin-auth] env missing — SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL não configurado", err);
        return false;
    }

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
        console.warn("[admin-auth] token inválido ou usuário não encontrado", { error: error?.message });
        return false;
    }

    const role = user.app_metadata?.role;
    if (role !== "admin") {
        console.warn("[admin-auth] usuário sem role admin", { role, userId: user.id });
        return false;
    }

    return true;
}

const VALID_PAGE_SIZES = [10, 25, 50];

export async function GET(request: NextRequest) {
    try {
        const isAdmin = await verifyAdminFromRequest(request);
        if (!isAdmin) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
        const rawPageSize = parseInt(searchParams.get("pageSize") ?? "25", 10);
        const pageSize = VALID_PAGE_SIZES.includes(rawPageSize) ? rawPageSize : 25;
        const search = searchParams.get("search")?.trim() ?? "";
        const dateFilter = searchParams.get("date")?.trim() ?? "";

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const supabase = getServiceRoleClient();

        // 1. Buscar IDs dos admins via auth.admin.listUsers (service_role)
        // Fazemos isso para calcular isAdmin corretamente com dados reais
        const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const adminIds = new Set((authData?.users ?? []).filter(u => u.app_metadata?.role === "admin").map(u => u.id));
        // Mapa de userId -> last_sign_in_at para exibir no painel admin
        const lastSignInMap = new Map<string, string | null>(
            (authData?.users ?? []).map(u => [u.id, u.last_sign_in_at ?? null]),
        );
        // Mapa de userId -> emailVerified (email_confirmed_at presente)
        const emailVerifiedMap = new Map<string, boolean>(
            (authData?.users ?? []).map(u => [u.id, !!u.email_confirmed_at]),
        );

        // 2. Buscar usuários de public.users
        // Se dateFilter presente: filtra pelo dia completo (UTC) e ordena do mais recente ao mais antigo
        // Caso contrário: paginação alfabética padrão
        let query = supabase
            .from("users")
            .select("id, email, nome, celular, created_at, accept_email_updates", {
                count: "exact",
            });

        if (dateFilter && /^\d{4}-\d{2}-\d{2}$/.test(dateFilter)) {
            // BRT = UTC-3, fixo desde 2019 (sem horário de verão)
            // Meia-noite BRT = 03:00 UTC; o dia BRT termina 24h depois
            const BRT_OFFSET_HOURS = 3;
            const [y, m, d] = dateFilter.split("-").map(Number);
            const startUTC = new Date(Date.UTC(y, m - 1, d, BRT_OFFSET_HOURS, 0, 0, 0));
            const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000 - 1);
            query = query
                .gte("created_at", startUTC.toISOString())
                .lte("created_at", endUTC.toISOString())
                .order("created_at", { ascending: false });
        } else {
            query = query
                .order("nome", { ascending: true, nullsFirst: false })
                .order("email", { ascending: true })
                .range(from, to);

            // Busca server-side por nome ou email
            // Remove caracteres especiais do PostgREST para evitar injeção de operadores
            if (search) {
                const safeSearch = search.replace(/[.,();%]/g, "");
                query = query.or(`nome.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
            }
        }

        const { data: usersData, count, error } = await query;

        if (error) {
            console.error("Erro ao buscar usuários:", error.message);
            return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
        }

        const users = (usersData ?? []).map(row => ({
            id: row.id,
            email: row.email,
            nome: row.nome,
            celular: row.celular,
            isAdmin: adminIds.has(row.id),
            createdAt: row.created_at,
            lastSignInAt: lastSignInMap.get(row.id) ?? null,
            acceptEmailUpdates: row.accept_email_updates,
            emailVerified: emailVerifiedMap.get(row.id) ?? false,
        }));

        return NextResponse.json({
            users,
            total: count ?? 0,
            page,
            pageSize,
        });
    } catch (err) {
        console.error("Erro inesperado na listagem de usuários:", err);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
