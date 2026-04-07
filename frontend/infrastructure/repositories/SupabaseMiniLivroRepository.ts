/**
 * SupabaseMiniLivroRepository (Infrastructure Layer)
 *
 * Implementação concreta do IMiniLivroRepository usando Supabase.
 * Inclui tratamento de erros resiliente - nunca quebra a aplicação.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta a API do Supabase para nosso domínio
 * - SRP: Responsável apenas pela comunicação com Supabase
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { MiniLivro, MiniLivroProps } from "../../domain/entities/MiniLivro";
import { IMiniLivroRepository } from "../../domain/repositories/IMiniLivroRepository";

/**
 * Interface que representa a estrutura da tabela no Supabase
 */
interface SupabaseMiniLivroRow {
    id: number;
    created_at: string;
    title: string;
    html_path: string | null;
    pdf_path: string | null;
    read_time: number;
    relative_ebook?: number | null;
    ebook_id?: number | null;
    part_order?: number | null;
    index: number;
}

/**
 * Adapter Pattern: Adapta Supabase para nossa interface de domínio
 */
export class SupabaseMiniLivroRepository implements IMiniLivroRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    /**
     * Obtém todos os mini-livros ordenados por data (mais recentes primeiro)
     * Retorna array vazio em caso de erro (graceful degradation)
     */
    async getAll(): Promise<MiniLivro[]> {
        try {
            const { data, error } = await this.supabase.from("mini_livros").select("*");

            if (error) {
                console.error("Erro ao buscar mini-livros:", error.message);
                return [];
            }

            if (!data || data.length === 0) {
                return [];
            }

            const items = data
                .filter((row): row is SupabaseMiniLivroRow => this.isValidRow(row))
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
            const { data, error } = await this.supabase.from("mini_livros").select("*").eq("id", id).single();

            if (error || !data) {
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
    private isValidRow(row: unknown): row is SupabaseMiniLivroRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        return r.id != null && typeof r.title === "string";
    }

    /**
     * Mapeia dados do Supabase para entidade de domínio
     * Adapter Pattern: Traduz formato externo para domínio
     */
    private mapToEntity(row: SupabaseMiniLivroRow): MiniLivro {
        const props: MiniLivroProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            title: row.title,
            htmlPath: row.html_path,
            pdfPath: row.pdf_path,
            readTime: row.read_time,
            ebookId: row.ebook_id ?? null,
            partOrder: row.part_order ?? row.relative_ebook ?? 1,
            index: row.index ?? 0,
        };
        return MiniLivro.create(props);
    }

    private sortByIndex(items: MiniLivro[]): MiniLivro[] {
        const indexed = items.filter(i => i.index > 0).sort((a, b) => a.index - b.index);
        const unindexed = items.filter(i => i.index === 0).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return [...indexed, ...unindexed];
    }
}
