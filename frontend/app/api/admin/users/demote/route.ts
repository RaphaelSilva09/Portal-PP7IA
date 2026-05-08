/**
 * Admin Users Demote API Route (Edge Function)
 *
 * Remove privilégios de admin de um usuário.
 * POST /api/admin/users/demote
 *
 * Segurança:
 * - Valida que requisição vem de admin autenticado
 * - Usa service_role key para operações em auth.users
 *
 * Princípios aplicados:
 * - Least Privilege: Operações privilegiadas isoladas
 * - Fail Secure: Retorna 403/401 em caso de não autorizado
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClientKey, getSupabaseUrl } from "@/infrastructure/config/supabase-env";

function getAnonClient() {
    return createClient(getSupabaseUrl(), getSupabaseClientKey(), {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

function getServiceRoleClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada");
    }

    return createClient(getSupabaseUrl(), serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Verifica se o usuário atual é admin via JWT
 */
async function verifyAdminFromRequest(request: NextRequest): Promise<boolean> {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) return false;

        const token = authHeader.replace("Bearer ", "");
        const supabase = getAnonClient();

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser(token);

        if (error || !user) return false;

        const role = user.app_metadata?.role;
        return role === "admin";
    } catch (error) {
        console.error("Erro ao verificar admin:", error);
        return false;
    }
}

/**
 * POST /api/admin/users/demote
 * Remove privilégios admin de um usuário
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Verificar se requisição vem de admin
        const isAdmin = await verifyAdminFromRequest(request);
        if (!isAdmin) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        // 2. Obter userId do body
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
        }

        // 3. Remover role do app_metadata
        const supabase = getServiceRoleClient();

        const { data, error } = await supabase.auth.admin.updateUserById(userId, {
            app_metadata: { role: null },
        });

        if (error) {
            console.error("Erro ao demover usuário:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, user: data.user });
    } catch (error) {
        console.error("Erro ao processar requisição:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
