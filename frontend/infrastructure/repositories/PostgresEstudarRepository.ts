/**
 * PostgresEstudarRepository (Infrastructure Layer)
 *
 * Implementação concreta do IEstudarRepository usando Postgres direto via `pg` Pool.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta Postgres para nosso domínio
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { pool } from "../../lib/db";
import { Estudar, EstudarProps } from "../../domain/entities/Estudar";
import { IEstudarRepository } from "../../domain/repositories/IEstudarRepository";

interface PostgresEstudarRow {
    id: number;
    created_at: string;
    updated_at?: string | null;
    title: string;
    html_path: string | null;
    pdf_path: string | null;
    read_time: number;
    index: number;
}

export class PostgresEstudarRepository implements IEstudarRepository {
    async getAll(): Promise<Estudar[]> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM estudar`,
            );

            const items = (rows as unknown[])
                .filter((row): row is PostgresEstudarRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row));
            return this.sortByIndex(items);
        } catch (err) {
            console.error("Erro inesperado ao buscar estudar:", err);
            return [];
        }
    }

    async getById(id: number): Promise<Estudar | null> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM estudar WHERE id = $1 LIMIT 1`,
                [id],
            );

            const data: unknown = rows[0] ?? null;
            if (!data || !this.isValidRow(data)) return null;
            return this.mapToEntity(data);
        } catch {
            return null;
        }
    }

    async getLatest(): Promise<Estudar | null> {
        try {
            const all = await this.getAll();
            return all[0] ?? null;
        } catch {
            return null;
        }
    }

    private isValidRow(row: unknown): row is PostgresEstudarRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        return typeof r.id === "number" && typeof r.title === "string";
    }

    private mapToEntity(row: PostgresEstudarRow): Estudar {
        const props: EstudarProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            updatedAt: row.updated_at ? new Date(row.updated_at) : null,
            title: row.title,
            htmlPath: row.html_path,
            pdfPath: row.pdf_path,
            readTime: row.read_time,
            index: row.index ?? 0,
        };
        return Estudar.create(props);
    }

    private sortByIndex(items: Estudar[]): Estudar[] {
        const indexed = items.filter(i => i.index > 0).sort((a, b) => a.index - b.index);
        const unindexed = items.filter(i => i.index === 0).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return [...indexed, ...unindexed];
    }
}
