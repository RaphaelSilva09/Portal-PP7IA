/**
 * SupabaseUserManagementRepository (Infrastructure Layer)
 *
 * Implementação concreta do IUserManagementRepository usando Supabase.
 * Todas as operações admin (listagem, promote/demote/delete) são executadas
 * via API routes com service_role, enviando o Bearer token do usuário logado.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta API routes para nosso domínio
 * - SRP: Responsável apenas por gerenciamento de usuários
 * - Defense in Depth: Todas operações admin via API route (service_role)
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
    GetUsersParams,
    IUserManagementRepository,
    PaginatedUsersResult,
    UpdateUserParams,
    UserListItem,
} from "../../domain/repositories/IUserManagementRepository";

export class SupabaseUserManagementRepository implements IUserManagementRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    /**
     * Obtém o token de acesso do usuário atual para autenticação nas API routes
     */
    private async getBearerToken(): Promise<string> {
        const {
            data: { session },
        } = await this.supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error("Sessão não encontrada — faça login novamente");
        }
        return session.access_token;
    }

    async getUsers(params: GetUsersParams): Promise<PaginatedUsersResult> {
        try {
            const token = await this.getBearerToken();

            const searchParams = new URLSearchParams({
                page: String(params.page),
                pageSize: String(params.pageSize),
            });

            if (params.search?.trim()) {
                searchParams.set("search", params.search.trim());
            }

            const response = await fetch(`/api/admin/users?${searchParams.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error("Erro ao buscar usuários:", response.status);
                return { users: [], total: 0, page: params.page, pageSize: params.pageSize };
            }

            const json = await response.json();

            return {
                users: json.users.map((row: {
                    id: string;
                    email: string;
                    nome: string;
                    celular: string;
                    isAdmin: boolean;
                    createdAt: string;
                    lastSignInAt: string | null;
                    acceptEmailUpdates: boolean;
                    acceptWhatsappUpdates: boolean;
                }) => ({
                    ...row,
                    createdAt: new Date(row.createdAt),
                    lastSignInAt: row.lastSignInAt ? new Date(row.lastSignInAt) : null,
                })),
                total: json.total,
                page: json.page,
                pageSize: json.pageSize,
            };
        } catch (err) {
            console.error("Erro inesperado ao buscar usuários:", err);
            return { users: [], total: 0, page: params.page, pageSize: params.pageSize };
        }
    }

    async getUserById(userId: string): Promise<UserListItem | null> {
        try {
            const { data, error } = await this.supabase
                .from("users")
                .select("id, email, nome, celular, created_at, accept_email_updates, accept_whatsapp_updates")
                .eq("id", userId)
                .single();

            if (error || !data) {
                return null;
            }

            return {
                id: data.id,
                email: data.email,
                nome: data.nome,
                celular: data.celular,
                isAdmin: false,
                createdAt: new Date(data.created_at),
                lastSignInAt: null,
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
            const token = await this.getBearerToken();

            const response = await fetch("/api/admin/users/promote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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
            const token = await this.getBearerToken();

            const response = await fetch("/api/admin/users/demote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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
            const token = await this.getBearerToken();

            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.ok;
        } catch (err) {
            console.error("Erro ao deletar usuário:", err);
            return false;
        }
    }

    async updateUser(userId: string, params: UpdateUserParams): Promise<void> {
        const token = await this.getBearerToken();

        const response = await fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const json = await response.json().catch(() => ({}));
            throw new Error(json.error ?? "Erro ao atualizar usuário");
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
