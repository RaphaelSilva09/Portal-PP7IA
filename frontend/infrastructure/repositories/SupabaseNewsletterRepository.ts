/**
 * SupabaseNewsletterRepository (Infrastructure Layer)
 *
 * Implementação concreta do INewsletterRepository usando Postgres direto via `pg` Pool.
 * Inclui tratamento de erros resiliente - nunca quebra a aplicação.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta Postgres para nosso domínio
 * - SRP: Responsável apenas pela comunicação com o banco
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { pool } from "../../lib/db";
import { Newsletter, NewsletterProps } from "../../domain/entities/Newsletter";
import { INewsletterRepository } from "../../domain/repositories/INewsletterRepository";

/**
 * Interface que representa a estrutura da tabela no banco
 */
interface SupabaseNewsletterRow {
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
export class SupabaseNewsletterRepository implements INewsletterRepository {
    /**
     * Obtém todas as newsletters ordenadas por data (mais recentes primeiro)
     * Retorna array vazio em caso de erro (graceful degradation)
     */
    async getAll(): Promise<Newsletter[]> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM newsletters`,
            );

            if (!rows || rows.length === 0) {
                return [];
            }

            const items = (rows as unknown[])
                .filter((row): row is SupabaseNewsletterRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row));
            return this.sortByIndex(items);
        } catch (err) {
            console.error("Erro inesperado ao buscar newsletters:", err);
            return [];
        }
    }

    /**
     * Obtém a newsletter com menor index (primeira na ordenação definida pelo admin)
     */
    async getLatest(): Promise<Newsletter | null> {
        try {
            const all = await this.getAll();
            return all[0] ?? null;
        } catch (err) {
            console.error("Erro ao buscar última newsletter:", err);
            return null;
        }
    }

    /**
     * Obtém uma newsletter pelo ID
     */
    async getById(id: number): Promise<Newsletter | null> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM newsletters WHERE id = $1 LIMIT 1`,
                [id],
            );

            const data: unknown = rows[0] ?? null;
            if (!data) {
                return null;
            }

            if (!this.isValidRow(data)) {
                return null;
            }

            return this.mapToEntity(data);
        } catch (err) {
            console.error(`Erro ao buscar newsletter ${id}:`, err);
            return null;
        }
    }

    /**
     * Valida se a row tem os campos mínimos necessários
     */
    private isValidRow(row: unknown): row is SupabaseNewsletterRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        return r.id != null && typeof r.title === "string";
    }

    /**
     * Mapeia dados do banco para entidade de domínio
     * Adapter Pattern: Traduz formato externo para domínio
     */
    private mapToEntity(row: SupabaseNewsletterRow): Newsletter {
        const props: NewsletterProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            title: row.title,
            htmlPath: row.html_path,
            pdfPath: row.pdf_path,
            readTime: row.read_time,
            index: row.index ?? 0,
        };
        return Newsletter.create(props);
    }

    private sortByIndex(items: Newsletter[]): Newsletter[] {
        const indexed = items.filter(i => i.index > 0).sort((a, b) => a.index - b.index);
        const unindexed = items.filter(i => i.index === 0).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return [...indexed, ...unindexed];
    }
}
