/**
 * PostgresAnnouncementBarRepository (Infrastructure Layer)
 *
 * Implementação concreta de IAnnouncementBarRepository usando Postgres direto via `pg` Pool.
 *
 * Princípios aplicados:
 * - Adapter Pattern: Adapta Postgres para interface de domínio
 * - SRP: Responsável apenas pela comunicação com a tabela announcement_bars
 * - Graceful Degradation: getAll() retorna [] em caso de erro
 */

import { pool } from "../../lib/db";
import { AnnouncementBar, AnnouncementBarProps } from "../../domain/entities/AnnouncementBar";
import {
    CreateAnnouncementBarInput,
    IAnnouncementBarRepository,
    UpdateAnnouncementBarInput,
} from "../../domain/repositories/IAnnouncementBarRepository";

interface PostgresAnnouncementBarRow {
    id: string;
    message: string;
    link_url: string | null;
    link_label: string | null;
    bg_color: string;
    text_color: string;
    is_active: boolean;
    priority: number;
    starts_at: string | null;
    ends_at: string | null;
    is_closable: boolean;
    created_at: string;
    updated_at: string;
}

export class PostgresAnnouncementBarRepository implements IAnnouncementBarRepository {
    async getAll(): Promise<AnnouncementBar[]> {
        try {
            const { rows } = await pool.query<PostgresAnnouncementBarRow>(
                `SELECT * FROM announcement_bars ORDER BY priority DESC`,
            );

            return rows.map(row => this.mapToEntity(row));
        } catch (err) {
            console.error("Erro inesperado ao buscar barras de aviso:", err);
            return [];
        }
    }

    async create(input: CreateAnnouncementBarInput): Promise<AnnouncementBar> {
        try {
            const { rows } = await pool.query<PostgresAnnouncementBarRow>(
                `INSERT INTO announcement_bars
                    (message, link_url, link_label, bg_color, text_color, is_active, priority, starts_at, ends_at, is_closable)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 RETURNING *`,
                [
                    input.message,
                    input.linkUrl ?? null,
                    input.linkLabel ?? null,
                    input.bgColor ?? "#1a1a1a",
                    input.textColor ?? "#ffffff",
                    input.isActive ?? true,
                    input.priority ?? 0,
                    input.startsAt?.toISOString() ?? null,
                    input.endsAt?.toISOString() ?? null,
                    input.isClosable ?? true,
                ],
            );

            const data = rows[0] ?? null;
            if (!data) throw new Error(`Falha ao criar barra de aviso: nenhum registro retornado`);
            return this.mapToEntity(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            throw new Error(`Falha ao criar barra de aviso: ${message}`);
        }
    }

    async update(id: string, input: UpdateAnnouncementBarInput): Promise<AnnouncementBar> {
        const updateData: Record<string, unknown> = {};
        if (input.message    !== undefined) updateData.message    = input.message;
        if (input.linkUrl    !== undefined) updateData.link_url   = input.linkUrl;
        if (input.linkLabel  !== undefined) updateData.link_label = input.linkLabel;
        if (input.bgColor    !== undefined) updateData.bg_color   = input.bgColor;
        if (input.textColor  !== undefined) updateData.text_color = input.textColor;
        if (input.isActive   !== undefined) updateData.is_active  = input.isActive;
        if (input.priority   !== undefined) updateData.priority   = input.priority;
        if (input.isClosable !== undefined) updateData.is_closable = input.isClosable;
        if (input.startsAt   !== undefined) updateData.starts_at  = input.startsAt?.toISOString() ?? null;
        if (input.endsAt     !== undefined) updateData.ends_at    = input.endsAt?.toISOString() ?? null;

        try {
            const columns = Object.keys(updateData);
            const values = Object.values(updateData);

            if (columns.length === 0) {
                // Nenhum campo para atualizar: buscar o registro atual.
                const { rows } = await pool.query<PostgresAnnouncementBarRow>(
                    `SELECT * FROM announcement_bars WHERE id = $1 LIMIT 1`,
                    [id],
                );
                const data = rows[0] ?? null;
                if (!data) throw new Error(`Falha ao atualizar barra de aviso: registro não encontrado`);
                return this.mapToEntity(data);
            }

            const setClause = columns.map((c, i) => `"${c}" = $${i + 1}`).join(", ");
            const idPlaceholder = `$${columns.length + 1}`;

            const { rows } = await pool.query<PostgresAnnouncementBarRow>(
                `UPDATE announcement_bars SET ${setClause} WHERE id = ${idPlaceholder} RETURNING *`,
                [...values, id],
            );

            const data = rows[0] ?? null;
            if (!data) throw new Error(`Falha ao atualizar barra de aviso: registro não encontrado`);
            return this.mapToEntity(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            throw new Error(`Falha ao atualizar barra de aviso: ${message}`);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await pool.query(`DELETE FROM announcement_bars WHERE id = $1`, [id]);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            throw new Error(`Falha ao deletar barra de aviso: ${message}`);
        }
    }

    async toggle(id: string, isActive: boolean): Promise<void> {
        try {
            await pool.query(
                `UPDATE announcement_bars SET is_active = $1 WHERE id = $2`,
                [isActive, id],
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            throw new Error(`Falha ao alternar barra de aviso: ${message}`);
        }
    }

    private mapToEntity(row: PostgresAnnouncementBarRow): AnnouncementBar {
        const props: AnnouncementBarProps = {
            id:         row.id,
            message:    row.message,
            linkUrl:    row.link_url,
            linkLabel:  row.link_label,
            bgColor:    row.bg_color,
            textColor:  row.text_color,
            isActive:   row.is_active,
            priority:   row.priority,
            startsAt:   row.starts_at ? new Date(row.starts_at) : null,
            endsAt:     row.ends_at   ? new Date(row.ends_at)   : null,
            isClosable: row.is_closable,
            createdAt:  new Date(row.created_at),
            updatedAt:  new Date(row.updated_at),
        };
        return AnnouncementBar.create(props);
    }
}
