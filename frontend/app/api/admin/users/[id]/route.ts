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

/**
 * PATCH /api/admin/users/[id]
 * Atualiza nome, email e celular de um usuário
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1. Verificar admin
        const isAdmin = await verifyAdminFromRequest(request);
        if (!isAdmin) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        // 2. Obter userId
        const { id: userId } = await params;
        if (!userId) {
            return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
        }

        // 3. Extrair e validar body
        const body = await request.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Body inválido" }, { status: 400 });
        }

        const { nome, email, celular } = body as { nome?: string; email?: string; celular?: string };

        // Validações básicas
        if (nome !== undefined && nome.trim().length < 2) {
            return NextResponse.json({ error: "Nome deve ter pelo menos 2 caracteres" }, { status: 422 });
        }
        if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Email inválido" }, { status: 422 });
        }
        if (celular !== undefined && !/^\d{10,11}$/.test(celular.replace(/\D/g, ""))) {
            return NextResponse.json({ error: "Celular inválido" }, { status: 422 });
        }

        const supabase = getServiceRoleClient();

        // 4. Atualizar email no auth.users se fornecido
        if (email) {
            const { error: authError } = await supabase.auth.admin.updateUserById(userId, { email });
            if (authError) {
                console.error("Erro ao atualizar email no auth:", authError);
                return NextResponse.json({ error: authError.message }, { status: 500 });
            }
        }

        // 5. Atualizar public.users
        const updateData: Record<string, string> = {};
        if (nome !== undefined) updateData.nome = nome.trim();
        if (email !== undefined) updateData.email = email;
        if (celular !== undefined) updateData.celular = celular.replace(/\D/g, "");

        if (Object.keys(updateData).length > 0) {
            const { error: dbError } = await supabase.from("users").update(updateData).eq("id", userId);
            if (dbError) {
                console.error("Erro ao atualizar public.users:", dbError);
                return NextResponse.json({ error: dbError.message }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao processar PATCH:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
