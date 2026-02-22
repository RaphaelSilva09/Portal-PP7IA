/**
 * SupabaseUserManagementRepository (Infrastructure Layer)
 *
 * Implementação concreta do IUserManagementRepository usando Supabase.
 * Operações de promote/demote/delete requerem service_role e são
 * executadas via API routes.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta APIs Supabase + API routes para nosso domínio
 * - SRP: Responsável apenas por gerenciamento de usuários
 * - Defense in Depth: Admin operations via API route (service_role)
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { IUserManagementRepository, UserListItem } from "../../domain/repositories/IUserManagementRepository";

/**
 * Interface que representa a estrutura da tabela users no Supabase
 */
interface SupabaseUserRow {
    id: string;
    email: string;
    nome: string;
    celular: string;
    created_at: string;
    accept_email_updates: boolean;
    accept_whatsapp_updates: boolean;
}

export class SupabaseUserManagementRepository implements IUserManagementRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async getAllUsers(): Promise<UserListItem[]> {
        try {
            // 1. Buscar dados da tabela public.users
            const { data: usersData, error: usersError } = await this.supabase
                .from("users")
                .select("*")
                .order("created_at", { ascending: false });

            if (usersError) {
                console.error("Erro ao buscar usuários:", usersError.message);
                return [];
            }

            if (!usersData || usersData.length === 0) {
                return [];
            }

            // 2. Para cada usuário, verificar se é admin via auth.users
            // Nota: Isso requer uma função no banco ou fazer via service_role
            // Por simplicidade, vamos fazer client-side via JWT do usuário logado
            const {
                data: { user },
            } = await this.supabase.auth.getUser();

            // Se o usuário atual não é admin, não pode ver outros usuários
            const currentUserRole = user?.app_metadata?.role;
            if (currentUserRole !== "admin") {
                return [];
            }

            // Mapear para UserListItem
            // Nota: Não temos como saber se outro usuário é admin apenas via public.users
            // Precisaríamos de uma view ou função no banco
            return usersData.map(row => ({
                id: row.id,
                email: row.email,
                nome: row.nome,
                celular: row.celular,
                isAdmin: false, // Será preenchido via API route se necessário
                createdAt: new Date(row.created_at),
                acceptEmailUpdates: row.accept_email_updates,
                acceptWhatsappUpdates: row.accept_whatsapp_updates,
            }));
        } catch (err) {
            console.error("Erro inesperado ao buscar usuários:", err);
            return [];
        }
    }

    async getUserById(userId: string): Promise<UserListItem | null> {
        try {
            const { data, error } = await this.supabase.from("users").select("*").eq("id", userId).single();

            if (error || !data) {
                return null;
            }

            return {
                id: data.id,
                email: data.email,
                nome: data.nome,
                celular: data.celular,
                isAdmin: false, // Seria necessário consultar auth.users
                createdAt: new Date(data.created_at),
                acceptEmailUpdates: data.accept_email_updates,
                acceptWhatsappUpdates: data.accept_whatsapp_updates,
            };
        } catch (err) {
            console.error("Erro ao buscar usuário por ID:", err);
            return null;
        }
    }

    async promoteToAdmin(userId: string): Promise<boolean> {
        try {
            // Operação via API route (requer service_role)
            const response = await fetch("/api/admin/users/promote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            return response.ok;
        } catch (err) {
            console.error("Erro ao promover usuário:", err);
            return false;
        }
    }

    async demoteFromAdmin(userId: string): Promise<boolean> {
        try {
            // Operação via API route (requer service_role)
            const response = await fetch("/api/admin/users/demote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            return response.ok;
        } catch (err) {
            console.error("Erro ao demover usuário:", err);
            return false;
        }
    }

    async deleteUser(userId: string): Promise<boolean> {
        try {
            // Operação via API route (requer service_role)
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });

            return response.ok;
        } catch (err) {
            console.error("Erro ao deletar usuário:", err);
            return false;
        }
    }

    async countUsers(): Promise<number> {
        try {
            const { count, error } = await this.supabase.from("users").select("*", { count: "exact", head: true });

            if (error) {
                console.error("Erro ao contar usuários:", error.message);
                return 0;
            }

            return count ?? 0;
        } catch (err) {
            console.error("Erro inesperado ao contar usuários:", err);
            return 0;
        }
    }

    async countNewUsers(days: number): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const { count, error } = await this.supabase
                .from("users")
                .select("*", { count: "exact", head: true })
                .gte("created_at", cutoffDate.toISOString());

            if (error) {
                console.error("Erro ao contar novos usuários:", error.message);
                return 0;
            }

            return count ?? 0;
        } catch (err) {
            console.error("Erro inesperado ao contar novos usuários:", err);
            return 0;
        }
    }
}
