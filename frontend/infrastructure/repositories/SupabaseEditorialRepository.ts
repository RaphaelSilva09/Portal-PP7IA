/**
 * SupabaseEditorialRepository (Infrastructure Layer)
 *
 * Implementação concreta do IEditorialRepository usando Postgres direto via `pg` Pool.
 * Tabela singleton: id = 1 sempre; usa upsert (INSERT ... ON CONFLICT) para salvar.
 */

import { Editorial } from "../../domain/entities/Editorial";
import { IEditorialRepository } from "../../domain/repositories/IEditorialRepository";
import { pool } from "../../lib/db";

export class SupabaseEditorialRepository implements IEditorialRepository {
    async get(): Promise<Editorial | null> {
        try {
            const { rows } = await pool.query<Record<string, unknown>>(
                `SELECT * FROM editorial WHERE id = $1 LIMIT 1`,
                [1],
            );
            const data = rows[0] ?? null;
            if (!data) return null;

            return {
                id: data.id as number,
                content: (data.content as string | null) ?? "",
                updatedAt: new Date(data.updated_at as string),
            };
        } catch {
            return null;
        }
    }

    async save(content: string): Promise<void> {
        const updatedAt = new Date().toISOString();
        await pool.query(
            `INSERT INTO editorial (id, content, updated_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (id) DO UPDATE
             SET content = EXCLUDED.content,
                 updated_at = EXCLUDED.updated_at`,
            [1, content, updatedAt],
        );
    }
}
