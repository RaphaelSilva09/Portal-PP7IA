/**
 * PostgresRadarOportunidadesRepository (Infrastructure Layer)
 *
 * Implementação concreta do IRadarOportunidadesRepository usando Postgres direto via `pg` Pool.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta Postgres para nosso domínio
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { pool } from "../../lib/db";
import { RadarOportunidades, RadarOportunidadesProps } from "../../domain/entities/RadarOportunidades";
import { IRadarOportunidadesRepository } from "../../domain/repositories/IRadarOportunidadesRepository";

interface PostgresRadarRow {
    id: number;
    created_at: string;
    updated_at?: string | null;
    title: string;
    html_path: string | null;
    pdf_path: string | null;
    read_time: number;
    index: number;
}

export class PostgresRadarOportunidadesRepository implements IRadarOportunidadesRepository {
    async getAll(): Promise<RadarOportunidades[]> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM radar_oportunidades`,
            );

            const items = (rows as unknown[])
                .filter((row): row is PostgresRadarRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row));
            return this.sortByIndex(items);
        } catch (err) {
            console.error("Erro inesperado ao buscar radar_oportunidades:", err);
            return [];
        }
    }

    async getById(id: number): Promise<RadarOportunidades | null> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM radar_oportunidades WHERE id = $1 LIMIT 1`,
                [id],
            );

            const data: unknown = rows[0] ?? null;
            if (!data || !this.isValidRow(data)) return null;
            return this.mapToEntity(data);
        } catch {
            return null;
        }
    }

    async getLatest(): Promise<RadarOportunidades | null> {
        try {
            const all = await this.getAll();
            return all[0] ?? null;
        } catch {
            return null;
        }
    }

    private isValidRow(row: unknown): row is PostgresRadarRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        // id vem como bigint do Postgres — o driver `pg` retorna bigint como string
        // (evita perda de precisão), então aceitar string numérica além de number.
        const idOk = typeof r.id === "number" || (typeof r.id === "string" && r.id !== "" && !isNaN(Number(r.id)));
        return idOk && typeof r.title === "string";
    }

    private mapToEntity(row: PostgresRadarRow): RadarOportunidades {
        const props: RadarOportunidadesProps = {
            id: Number(row.id),
            createdAt: new Date(row.created_at),
            updatedAt: row.updated_at ? new Date(row.updated_at) : null,
            title: row.title,
            htmlPath: row.html_path,
            pdfPath: row.pdf_path,
            readTime: row.read_time,
            index: row.index ?? 0,
        };
        return RadarOportunidades.create(props);
    }

    private sortByIndex(items: RadarOportunidades[]): RadarOportunidades[] {
        const indexed = items.filter(i => i.index > 0).sort((a, b) => a.index - b.index);
        const unindexed = items.filter(i => i.index === 0).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return [...indexed, ...unindexed];
    }
}
