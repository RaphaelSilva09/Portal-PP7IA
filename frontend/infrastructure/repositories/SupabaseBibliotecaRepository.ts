/**
 * SupabaseBibliotecaRepository (Infrastructure Layer)
 *
 * Implementação concreta do IBibliotecaRepository usando Supabase.
 * Inclui tratamento de erros resiliente - nunca quebra a aplicação.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta a API do Supabase para nosso domínio
 * - SRP: Responsável apenas pela comunicação com Supabase
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { BibliotecaItem, BibliotecaItemProps } from "../../domain/entities/BibliotecaItem";
import { IBibliotecaRepository } from "../../domain/repositories/IBibliotecaRepository";

/**
 * Interface que representa a estrutura da tabela no Supabase
 */
interface SupabaseBibliotecaRow {
    id: number;
    created_at: string;
    title: string;
    html_path: string | null;
    pdf_path: string | null;
}

/**
 * Adapter Pattern: Adapta Supabase para nossa interface de domínio
 */
export class SupabaseBibliotecaRepository implements IBibliotecaRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    /**
     * Obtém todos os itens da biblioteca ordenados por data (mais recentes primeiro)
     * Retorna array vazio em caso de erro (graceful degradation)
     */
    async getAll(): Promise<BibliotecaItem[]> {
        try {
            const { data, error } = await this.supabase
                .from("biblioteca")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Erro ao buscar biblioteca:", error.message);
                return [];
            }

            if (!data || data.length === 0) {
                return [];
            }

            return data
                .filter((row): row is SupabaseBibliotecaRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row));
        } catch (err) {
            console.error("Erro inesperado ao buscar biblioteca:", err);
            return [];
        }
    }

    /**
     * Obtém o item mais recente da biblioteca
     */
    async getLatest(): Promise<BibliotecaItem | null> {
        try {
            const { data, error } = await this.supabase
                .from("biblioteca")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (error || !data) {
                return null;
            }

            if (!this.isValidRow(data)) {
                return null;
            }

            return this.mapToEntity(data);
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
            const { data, error } = await this.supabase
                .from("biblioteca")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
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
    private isValidRow(row: unknown): row is SupabaseBibliotecaRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        return r.id != null && typeof r.title === "string";
    }

    /**
     * Mapeia dados do Supabase para entidade de domínio
     * Adapter Pattern: Traduz formato externo para domínio
     */
    private mapToEntity(row: SupabaseBibliotecaRow): BibliotecaItem {
        const props: BibliotecaItemProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            title: row.title,
            htmlPath: row.html_path,
            pdfPath: row.pdf_path,
        };
        return BibliotecaItem.create(props);
    }
}
