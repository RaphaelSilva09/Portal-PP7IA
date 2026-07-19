/**
 * PostgresBibliotecaRepository (Infrastructure Layer)
 *
 * Implementação concreta do IBibliotecaRepository usando Postgres direto via `pg` Pool.
 * Inclui tratamento de erros resiliente - nunca quebra a aplicação.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta Postgres para nosso domínio
 * - SRP: Responsável apenas pela comunicação com o banco
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { pool } from "../../lib/db";
import { BibliotecaItem, BibliotecaItemProps, BibliotecaTema } from "../../domain/entities/BibliotecaItem";
import { IBibliotecaRepository } from "../../domain/repositories/IBibliotecaRepository";

/**
 * Interface que representa a estrutura da tabela no banco
 */
interface PostgresBibliotecaRow {
    id: number;
    created_at: string;
    title: string;
    html_path: string | null;
    pdf_path: string | null;
    read_time: number;
    tema: string;
    index: number;
}

const VALID_TEMAS: BibliotecaTema[] = [
    "biblioteca-dos-7",
    "saude",
    "investimentos-financas",
    "viagens-restaurantes",
    "tecnologia",
    "prompts",
    "diversos",
];

function parseTema(raw: unknown): BibliotecaTema {
    if (typeof raw === "string" && (VALID_TEMAS as string[]).includes(raw)) {
        return raw as BibliotecaTema;
    }
    return "diversos";
}

/**
 * Adapter Pattern: Adapta Postgres para nossa interface de domínio
 */
export class PostgresBibliotecaRepository implements IBibliotecaRepository {
    /**
     * Obtém todos os itens da biblioteca ordenados por data (mais recentes primeiro)
     * Retorna array vazio em caso de erro (graceful degradation)
     */
    async getAll(): Promise<BibliotecaItem[]> {
        try {
            const { rows } = await pool.query<Record<string, unknown>>(
                `SELECT * FROM biblioteca`,
            );

            if (!rows || rows.length === 0) {
                return [];
            }

            const items = rows
                .filter(row => this.isValidRow(row))
                .map(row => this.mapToEntity(row as unknown as PostgresBibliotecaRow));
            return this.sortByIndex(items);
        } catch (err) {
            console.error("Erro inesperado ao buscar biblioteca:", err);
            return [];
        }
    }

    /**
     * Obtém o item com menor index (primeiro na ordenação definida pelo admin)
     */
    async getLatest(): Promise<BibliotecaItem | null> {
        try {
            const all = await this.getAll();
            return all[0] ?? null;
        } catch (err) {
            console.error("Erro ao buscar último item da biblioteca:", err);
            return null;
        }
    }

    /**
     * Obtém um item da biblioteca pelo ID
     */
    async getById(id: number): Promise<BibliotecaItem | null> {
        try {
            const { rows } = await pool.query<Record<string, unknown>>(
                `SELECT * FROM biblioteca WHERE id = $1 LIMIT 1`,
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
            console.error(`Erro ao buscar item da biblioteca ${id}:`, err);
            return null;
        }
    }

    /**
     * Valida se a row tem os campos mínimos necessários
     */
    private isValidRow(row: unknown): row is PostgresBibliotecaRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        return r.id != null && typeof r.title === "string";
    }

    /**
     * Mapeia dados do banco para entidade de domínio
     * Adapter Pattern: Traduz formato externo para domínio
     */
    private mapToEntity(row: PostgresBibliotecaRow): BibliotecaItem {
        const props: BibliotecaItemProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            title: row.title,
            htmlPath: row.html_path,
            pdfPath: row.pdf_path,
            readTime: row.read_time,
            tema: parseTema(row.tema),
            index: row.index ?? 0,
        };
        return BibliotecaItem.create(props);
    }

    private sortByIndex(items: BibliotecaItem[]): BibliotecaItem[] {
        const indexed = items.filter(i => i.index > 0).sort((a, b) => a.index - b.index);
        const unindexed = items.filter(i => i.index === 0).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return [...indexed, ...unindexed];
    }
}
