/**
 * PostgresEspecialSemanaRepository (Infrastructure Layer)
 *
 * Implementação concreta do IEspecialSemanaRepository usando Postgres direto via `pg` Pool.
 * Inclui tratamento de erros resiliente - nunca quebra a aplicação.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta Postgres para nosso domínio
 * - SRP: Responsável apenas pela comunicação com o banco
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { pool } from "../../lib/db";
import { EspecialSemana, EspecialSemanaProps } from "../../domain/entities/EspecialSemana";
import {
    CreateEspecialSemanaInput,
    IEspecialSemanaRepository,
    UpdateEspecialSemanaInput,
} from "../../domain/repositories/IEspecialSemanaRepository";

/**
 * Interface que representa a estrutura da tabela no banco
 */
interface PostgresEspecialSemanaRow {
    id: number;
    created_at: string;
    title: string;
    html_path: string | null;
    pdf_path: string | null;
    read_time: number;
    index: number;
}

/**
 * Adapter Pattern: Adapta Postgres para nossa interface de domínio
 */
export class PostgresEspecialSemanaRepository implements IEspecialSemanaRepository {
    async getAll(): Promise<EspecialSemana[]> {
        try {
            const { rows } = await pool.query<Record<string, unknown>>(
                `SELECT * FROM especial_semana`,
            );

            if (!rows || rows.length === 0) {
                return [];
            }

            const items = rows
                .filter(row => this.isValidRow(row))
                .map(row => this.mapToEntity(row as unknown as PostgresEspecialSemanaRow));
            return this.sortByIndex(items);
        } catch (err) {
            console.error("Erro inesperado ao buscar especial-semana:", err);
            return [];
        }
    }

    async getById(id: number): Promise<EspecialSemana | null> {
        try {
            const { rows } = await pool.query<Record<string, unknown>>(
                `SELECT * FROM especial_semana WHERE id = $1 LIMIT 1`,
                [id],
            );

            const data = rows[0] ?? null;
            if (!data) {
                return null;
            }

            if (!this.isValidRow(data)) {
                return null;
            }

            return this.mapToEntity(data);
        } catch (err) {
            console.error("Erro ao buscar especial-semana por ID:", err);
            return null;
        }
    }

    async getLatest(): Promise<EspecialSemana | null> {
        try {
            const all = await this.getAll();
            return all[0] ?? null;
        } catch (err) {
            console.error("Erro ao buscar último especial-semana:", err);
            return null;
        }
    }

    async create(input: CreateEspecialSemanaInput): Promise<EspecialSemana> {
        try {
            const now = new Date().toISOString();
            const { rows } = await pool.query<Record<string, unknown>>(
                `INSERT INTO especial_semana (title, read_time, html_path, pdf_path, created_at)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [
                    input.title,
                    input.readTime,
                    input.htmlPath || null,
                    input.pdfPath || null,
                    now,
                ],
            );

            const data = rows[0] ?? null;
            if (!data || !this.isValidRow(data)) {
                throw new Error(`Erro ao criar especial_semana: nenhum registro retornado`);
            }

            return this.mapToEntity(data);
        } catch (err) {
            console.error("Erro ao criar especial-semana:", err);
            throw err;
        }
    }

    async update(id: number, input: UpdateEspecialSemanaInput): Promise<EspecialSemana | null> {
        try {
            const updateData: Record<string, unknown> = {};

            if (input.title !== undefined) updateData.title = input.title;
            if (input.readTime !== undefined) updateData.read_time = input.readTime;
            if (input.htmlPath !== undefined) updateData.html_path = input.htmlPath;
            if (input.pdfPath !== undefined) updateData.pdf_path = input.pdfPath;

            const columns = Object.keys(updateData);
            const values = Object.values(updateData);

            if (columns.length === 0) {
                // Nenhum campo para atualizar — retorna o registro atual
                return await this.getById(id);
            }

            const setClause = columns.map((c, i) => `"${c}" = $${i + 1}`).join(", ");
            const idPlaceholder = `$${columns.length + 1}`;

            const { rows } = await pool.query<Record<string, unknown>>(
                `UPDATE especial_semana SET ${setClause} WHERE id = ${idPlaceholder} RETURNING *`,
                [...values, id],
            );

            const data = rows[0] ?? null;
            if (!data || !this.isValidRow(data)) {
                return null;
            }

            return this.mapToEntity(data);
        } catch (err) {
            console.error("Erro ao atualizar especial-semana:", err);
            return null;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            await pool.query(`DELETE FROM especial_semana WHERE id = $1`, [id]);
            return true;
        } catch (err) {
            console.error("Erro ao deletar especial-semana:", err);
            return false;
        }
    }

    async count(): Promise<number> {
        try {
            const { rows } = await pool.query<{ count: string }>(
                `SELECT count(*)::text AS count FROM especial_semana`,
            );

            return Number(rows[0]?.count ?? 0);
        } catch (err) {
            console.error("Erro inesperado ao contar especial-semana:", err);
            return 0;
        }
    }

    /**
     * Valida se o row do banco contém os campos necessários
     */
    private isValidRow(row: unknown): row is PostgresEspecialSemanaRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        return (
            typeof r.id === "number" &&
            (typeof r.created_at === "string" || r.created_at instanceof Date) &&
            typeof r.title === "string" &&
            typeof r.read_time === "number"
        );
    }

    /**
     * Mapeia row do banco para entidade de domínio
     */
    private mapToEntity(row: PostgresEspecialSemanaRow): EspecialSemana {
        const props: EspecialSemanaProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            title: row.title,
            htmlPath: row.html_path,
            pdfPath: row.pdf_path,
            readTime: row.read_time,
            index: row.index ?? 0,
        };
        return EspecialSemana.create(props);
    }

    private sortByIndex(items: EspecialSemana[]): EspecialSemana[] {
        const indexed = items.filter(i => i.index > 0).sort((a, b) => a.index - b.index);
        const unindexed = items.filter(i => i.index === 0).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return [...indexed, ...unindexed];
    }
}
