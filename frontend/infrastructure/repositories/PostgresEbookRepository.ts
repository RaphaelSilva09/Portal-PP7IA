/**
 * PostgresEbookRepository (Infrastructure Layer)
 *
 * Implementação concreta do IEbookRepository usando Postgres direto via `pg` Pool.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta Postgres para nosso domínio
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { pool } from "../../lib/db";
import { Ebook, EbookProps } from "../../domain/entities/Ebook";
import { IEbookRepository } from "../../domain/repositories/IEbookRepository";

interface PostgresEbookRow {
    id: number;
    created_at: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_path: string | null;
    cover_pdf_path: string | null;
    intro_html_path: string | null;
    intro_pdf_path: string | null;
    badge_text: string | null;
    read_time: number;
    order: number;
}

export class PostgresEbookRepository implements IEbookRepository {
    async getAll(): Promise<Ebook[]> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM ebooks`,
            );

            return (rows as unknown[])
                .filter((row): row is PostgresEbookRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row))
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        } catch (err) {
            console.error("Erro inesperado ao buscar ebooks:", err);
            return [];
        }
    }

    async getById(id: number): Promise<Ebook | null> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM ebooks WHERE id = $1 LIMIT 1`,
                [id],
            );

            const data: unknown = rows[0] ?? null;
            if (!data || !this.isValidRow(data)) return null;
            return this.mapToEntity(data);
        } catch {
            return null;
        }
    }

    async getLatest(): Promise<Ebook | null> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM ebooks ORDER BY id DESC LIMIT 1`,
            );

            const data: unknown = rows[0] ?? null;
            if (!data || !this.isValidRow(data)) return null;
            return this.mapToEntity(data);
        } catch {
            return null;
        }
    }

    private isValidRow(row: unknown): row is PostgresEbookRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        // id vem como bigint do Postgres — o driver `pg` retorna bigint como string
        // (evita perda de precisão), então aceitar string numérica além de number.
        const idOk = typeof r.id === "number" || (typeof r.id === "string" && r.id !== "" && !isNaN(Number(r.id)));
        return idOk && typeof r.title === "string";
    }

    private mapToEntity(row: PostgresEbookRow): Ebook {
        const props: EbookProps = {
            id: Number(row.id),
            createdAt: new Date(row.created_at),
            title: row.title,
            subtitle: row.subtitle ?? null,
            description: row.description ?? null,
            coverImagePath: row.cover_image_path ?? null,
            coverPdfPath: row.cover_pdf_path ?? null,
            introHtmlPath: row.intro_html_path ?? null,
            introPdfPath: row.intro_pdf_path ?? null,
            badgeText: row.badge_text ?? null,
            readTime: row.read_time,
            order: row.order,
        };
        return Ebook.create(props);
    }
}
