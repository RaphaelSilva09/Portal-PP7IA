/**
 * PostgresMiniLivroRepository (Infrastructure Layer)
 *
 * Implementação concreta do IMiniLivroRepository usando Postgres direto via `pg` Pool.
 * Inclui tratamento de erros resiliente - nunca quebra a aplicação.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta Postgres para nosso domínio
 * - SRP: Responsável apenas pela comunicação com o banco
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { pool } from "../../lib/db";
import { MiniLivro, MiniLivroProps } from "../../domain/entities/MiniLivro";
import { IMiniLivroRepository } from "../../domain/repositories/IMiniLivroRepository";

/**
 * Interface que representa a estrutura da tabela no banco
 */
interface PostgresMiniLivroRow {
    id: number;
    created_at: string;
    updated_at?: string | null;
    title: string;
    html_path: string | null;
    pdf_path: string | null;
    read_time: number;
    ebook_id: number | null;
    index: number;
    part_order: number;
}

/**
 * Adapter Pattern: Adapta Postgres para nossa interface de domínio
 */
export class PostgresMiniLivroRepository implements IMiniLivroRepository {
    /**
     * Obtém todos os mini-livros ordenados por data (mais recentes primeiro)
     * Retorna array vazio em caso de erro (graceful degradation)
     */
    async getAll(): Promise<MiniLivro[]> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM mini_livros`,
            );

            if (!rows || rows.length === 0) {
                return [];
            }

            const items = (rows as unknown[])
                .filter((row): row is PostgresMiniLivroRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row));
            return this.sortByIndex(items);
        } catch (err) {
            console.error("Erro inesperado ao buscar mini-livros:", err);
            return [];
        }
    }

    /**
     * Obtém o mini-livro com menor index (primeiro na ordenação definida pelo admin)
     */
    async getLatest(): Promise<MiniLivro | null> {
        try {
            const all = await this.getAll();
            return all[0] ?? null;
        } catch (err) {
            console.error("Erro ao buscar último mini-livro:", err);
            return null;
        }
    }

    /**
     * Obtém um mini-livro pelo ID
     */
    async getById(id: number): Promise<MiniLivro | null> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM mini_livros WHERE id = $1 LIMIT 1`,
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
            console.error(`Erro ao buscar mini-livro ${id}:`, err);
            return null;
        }
    }

    /**
     * Valida se a row tem os campos mínimos necessários
     */
    private isValidRow(row: unknown): row is PostgresMiniLivroRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        return r.id != null && typeof r.title === "string";
    }

    /**
     * Mapeia dados do banco para entidade de domínio
     * Adapter Pattern: Traduz formato externo para domínio
     */
    private mapToEntity(row: PostgresMiniLivroRow): MiniLivro {
        const props: MiniLivroProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            updatedAt: row.updated_at ? new Date(row.updated_at) : null,
            title: row.title,
            htmlPath: row.html_path,
            pdfPath: row.pdf_path,
            readTime: row.read_time,
            ebookId: row.ebook_id ?? null,
            index: row.index ?? 0,
            partOrder: row.part_order ?? 1,
        };
        return MiniLivro.create(props);
    }

    private sortByIndex(items: MiniLivro[]): MiniLivro[] {
        const indexed = items.filter(i => i.index > 0).sort((a, b) => a.index - b.index);
        const unindexed = items.filter(i => i.index === 0).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return [...indexed, ...unindexed];
    }
}
