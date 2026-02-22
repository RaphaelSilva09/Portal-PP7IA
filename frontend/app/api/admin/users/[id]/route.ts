/**
 * Admin Users Delete API Route (Edge Function)
 *
 * Deleta um usuário do sistema.
 * DELETE /api/admin/users/[id]
 *
 * Segurança:
 * - Valida que requisição vem de admin autenticado
 * - Usa service_role key para deletar de auth.users
 * - Cascade delete em public.users via FK
 *
 * Princípios aplicados:
 * - Least Privilege: Operações privilegiadas isoladas
 * - Fail Secure: Retorna 403/401 em caso de não autorizado
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Cliente Supabase com service_role para operações admin
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

/**
 * Verifica se o usuário atual é admin via JWT
 */
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
    } catch (error) {
        console.error("Erro ao verificar admin:", error);
        return false;
    }
}

/**
 * DELETE /api/admin/users/[id]
 * Deleta um usuário permanentemente
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1. Verificar se requisição vem de admin
        const isAdmin = await verifyAdminFromRequest(request);
        if (!isAdmin) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        // 2. Obter userId dos params
        const { id: userId } = await params;

        if (!userId) {
            return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
        }

        // 3. Deletar usuário (cascade delete em public.users via FK)
        const supabase = getServiceRoleClient();

        const { error } = await supabase.auth.admin.deleteUser(userId);

        if (error) {
            console.error("Erro ao deletar usuário:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao processar requisição:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
