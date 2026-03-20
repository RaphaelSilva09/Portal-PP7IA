/**
 * SupabaseNewsletterRepository (Infrastructure Layer)
 *
 * Implementação concreta do INewsletterRepository usando Supabase.
 * Inclui tratamento de erros resiliente - nunca quebra a aplicação.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta a API do Supabase para nosso domínio
 * - SRP: Responsável apenas pela comunicação com Supabase
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Newsletter, NewsletterProps } from "../../domain/entities/Newsletter";
import { INewsletterRepository } from "../../domain/repositories/INewsletterRepository";

/**
 * Interface que representa a estrutura da tabela no Supabase
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
 * Adapter Pattern: Adapta Supabase para nossa interface de domínio
 */
export class SupabaseNewsletterRepository implements INewsletterRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    /**
     * Obtém todas as newsletters ordenadas por data (mais recentes primeiro)
     * Retorna array vazio em caso de erro (graceful degradation)
     */
    async getAll(): Promise<Newsletter[]> {
        try {
            const { data, error } = await this.supabase.from("newsletters").select("*");

            if (error) {
                console.error("Erro ao buscar newsletters:", error.message);
                return [];
            }

            if (!data || data.length === 0) {
                return [];
            }

            const items = data
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
            const { data, error } = await this.supabase.from("newsletters").select("*").eq("id", id).single();

            if (error || !data) {
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
     * Mapeia dados do Supabase para entidade de domínio
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
