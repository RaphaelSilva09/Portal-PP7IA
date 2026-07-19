/**
 * UserManagementRepository (HTTP adapter)
 *
 * Calls the /api/admin/users/* routes which now query the better-auth user
 * table directly. Authentication uses the better-auth session cookie sent
 * automatically by the browser — no Bearer token needed.
 *
 * File name kept (PostgresUserManagementRepository) for git/DI continuity;
 * implementation no longer touches Postgres. Rename in a follow-up.
 */
import {
    GetUsersParams,
    IUserManagementRepository,
    PaginatedUsersResult,
    UpdateUserParams,
    UserListItem,
} from "../../domain/repositories/IUserManagementRepository";

interface AdminUserRow {
    id: string;
    email: string;
    nome: string;
    celular: string;
    isAdmin: boolean;
    createdAt: string;
    lastSignInAt: string | null;
    acceptEmailUpdates: boolean;
    acceptWhatsappUpdates: boolean;
    emailVerified: boolean;
}

function mapRow(row: AdminUserRow): UserListItem {
    return {
        ...row,
        createdAt: new Date(row.createdAt),
        lastSignInAt: row.lastSignInAt ? new Date(row.lastSignInAt) : null,
    };
}

export class PostgresUserManagementRepository implements IUserManagementRepository {
    async getUsers(params: GetUsersParams): Promise<PaginatedUsersResult> {
        try {
            const sp = new URLSearchParams({
                page: String(params.page),
                pageSize: String(params.pageSize),
            });
            if (params.search?.trim()) sp.set("search", params.search.trim());

            const res = await fetch(`/api/admin/users?${sp.toString()}`);
            if (!res.ok) {
                console.error("Erro ao buscar usuários:", res.status);
                return { users: [], total: 0, page: params.page, pageSize: params.pageSize };
            }
            const json = (await res.json()) as { users: AdminUserRow[]; total: number; page: number; pageSize: number };
            return {
                users: json.users.map(mapRow),
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
        // No /api/admin/users/[id] GET route. Fetch via list w/ search by id is not supported;
        // for now consume getUsers + filter in caller, or expose a dedicated GET later.
        // Kept here as a documented gap to avoid silent 404.
        const res = await fetch(`/api/admin/users?search=${encodeURIComponent(userId)}`);
        if (!res.ok) return null;
        const json = (await res.json()) as { users: AdminUserRow[] };
        const match = json.users.find((u) => u.id === userId);
        return match ? mapRow(match) : null;
    }

    async promoteToAdmin(userId: string): Promise<boolean> {
        try {
            const res = await fetch("/api/admin/users/promote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            return res.ok;
        } catch (err) {
            console.error("Erro ao promover usuário:", err);
            return false;
        }
    }

    async demoteFromAdmin(userId: string): Promise<boolean> {
        try {
            const res = await fetch("/api/admin/users/demote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            return res.ok;
        } catch (err) {
            console.error("Erro ao demover usuário:", err);
            return false;
        }
    }

    async deleteUser(userId: string): Promise<boolean> {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
            return res.ok;
        } catch (err) {
            console.error("Erro ao deletar usuário:", err);
            return false;
        }
    }

    async updateUser(userId: string, params: UpdateUserParams): Promise<void> {
        const res = await fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error((json as { error?: string }).error ?? "Erro ao atualizar usuário");
        }
    }

    async countUsers(): Promise<number> {
        const res = await fetch(`/api/admin/users?page=1&pageSize=10`);
        if (!res.ok) return 0;
        const json = (await res.json()) as { total: number };
        return json.total ?? 0;
    }

    async getUsersByDate(date: Date): Promise<UserListItem[]> {
        try {
            const dateStr = date.toISOString().slice(0, 10);
            const res = await fetch(`/api/admin/users?date=${dateStr}`);
            if (!res.ok) return [];
            const json = (await res.json()) as { users: AdminUserRow[] };
            return (json.users ?? []).map(mapRow);
        } catch (err) {
            console.error("Erro inesperado ao buscar cadastros por data:", err);
            return [];
        }
    }

    async countNewUsers(_days: number): Promise<number> {
        // Backed by mv_admin_dashboard_stats once the analytics route exposes it.
        // Returning 0 is non-fatal for the admin UI; revisit when the route lands.
        return 0;
    }
}
