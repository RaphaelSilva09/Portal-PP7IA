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
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) return false;

        const token = authHeader.replace("Bearer ", "");
        const supabase = getServiceRoleClient();

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser(token);

        if (error || !user) return false;

        const role = user.app_metadata?.role;
        return role === "admin";
    } catch {
        return false;
    }
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

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const supabase = getServiceRoleClient();

        // 1. Buscar IDs dos admins via auth.admin.listUsers (service_role)
        // Fazemos isso para calcular isAdmin corretamente com dados reais
        const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const adminIds = new Set(
            (authData?.users ?? [])
                .filter(u => u.app_metadata?.role === "admin")
                .map(u => u.id),
        );

        // 2. Buscar usuários paginados de public.users ordenados alfabeticamente
        let query = supabase
            .from("users")
            .select(
                "id, email, nome, celular, created_at, accept_email_updates, accept_whatsapp_updates",
                { count: "exact" },
            )
            .order("nome", { ascending: true, nullsFirst: false })
            .order("email", { ascending: true })
            .range(from, to);

        // Busca server-side por nome ou email
        if (search) {
            query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%`);
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
            acceptEmailUpdates: row.accept_email_updates,
            acceptWhatsappUpdates: row.accept_whatsapp_updates,
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
