/**
 * PostgresAdminRepository (Infrastructure Layer)
 *
 * Verifica se um usuário é admin consultando a coluna `role` na tabela
 * `"user"` do better-auth (Postgres direto via `pg` Pool).
 *
 * Princípios aplicados:
 * - Adapter Pattern: Adapta Postgres para interface de domínio
 * - SRP: Responsável apenas por verificação de admin
 * - Graceful Degradation: Retorna false em caso de erro
 */

import { pool } from "@/lib/db";
import type { IAdminRepository } from "@/domain/repositories/IAdminRepository";

export class PostgresAdminRepository implements IAdminRepository {
    async isAdmin(userId: string): Promise<boolean> {
        try {
            const { rows } = await pool.query<{ role: string | null }>(
                `SELECT role FROM "user" WHERE id = $1 LIMIT 1`,
                [userId],
            );
            const row = rows[0] ?? null;
            if (!row) return false;
            return row.role === "admin";
        } catch {
            return false;
        }
    }
}
