/**
 * SupabaseEspecialSemanaRepository (Infrastructure Layer)
 *
 * Implementação concreta do IEspecialSemanaRepository usando Supabase.
 * Inclui tratamento de erros resiliente - nunca quebra a aplicação.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta a API do Supabase para nosso domínio
 * - SRP: Responsável apenas pela comunicação com Supabase
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { EspecialSemana, EspecialSemanaProps } from "../../domain/entities/EspecialSemana";
import {
    CreateEspecialSemanaInput,
    IEspecialSemanaRepository,
    UpdateEspecialSemanaInput,
} from "../../domain/repositories/IEspecialSemanaRepository";

/**
 * Interface que representa a estrutura da tabela no Supabase
 */
interface SupabaseEspecialSemanaRow {
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
export class SupabaseEspecialSemanaRepository implements IEspecialSemanaRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async getAll(): Promise<EspecialSemana[]> {
        try {
            const { data, error } = await this.supabase.from("especial_semana").select("*");

            if (error) {
                console.error("Erro ao buscar especial_semana:", error.message);
                return [];
            }

            if (!data || data.length === 0) {
                return [];
            }

            const items = data
                .filter((row): row is SupabaseEspecialSemanaRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row));
            return this.sortByIndex(items);
        } catch (err) {
            console.error("Erro inesperado ao buscar especial-semana:", err);
            return [];
        }
    }

    async getById(id: number): Promise<EspecialSemana | null> {
        try {
            const { data, error } = await this.supabase.from("especial_semana").select("*").eq("id", id).single();

            if (error || !data) {
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
            const { data, error } = await this.supabase
                .from("especial_semana")
                .insert({
                    title: input.title,
                    read_time: input.readTime,
                    html_path: input.htmlPath || null,
                    pdf_path: input.pdfPath || null,
                })
                .select()
                .single();

            if (error || !data) {
                throw new Error(`Erro ao criar especial_semana: ${error?.message}`);
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

            const { data, error } = await this.supabase
                .from("especial_semana")
                .update(updateData)
                .eq("id", id)
                .select()
                .single();

            if (error || !data) {
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
            const { error } = await this.supabase.from("especial_semana").delete().eq("id", id);

            return !error;
        } catch (err) {
            console.error("Erro ao deletar especial-semana:", err);
            return false;
        }
    }

    async count(): Promise<number> {
        try {
            const { count, error } = await this.supabase
                .from("especial_semana")
                .select("*", { count: "exact", head: true });

            if (error) {
                console.error("Erro ao contar especial-semana:", error.message);
                return 0;
            }

            return count ?? 0;
        } catch (err) {
            console.error("Erro inesperado ao contar especial-semana:", err);
            return 0;
        }
    }

    /**
     * Valida se o row do Supabase contém os campos necessários
     */
    private isValidRow(row: unknown): row is SupabaseEspecialSemanaRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        return (
            typeof r.id === "number" &&
            typeof r.created_at === "string" &&
            typeof r.title === "string" &&
            typeof r.read_time === "number"
        );
    }

    /**
     * Mapeia row do Supabase para entidade de domínio
     */
    private mapToEntity(row: SupabaseEspecialSemanaRow): EspecialSemana {
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
