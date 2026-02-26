/**
 * SupabaseEstudarRepository (Infrastructure Layer)
 *
 * Implementação concreta do IEstudarRepository usando Supabase.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta a API do Supabase para nosso domínio
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Estudar, EstudarProps } from "../../domain/entities/Estudar";
import { IEstudarRepository } from "../../domain/repositories/IEstudarRepository";

interface SupabaseEstudarRow {
    id: number;
    created_at: string;
    title: string;
    html_path: string | null;
    pdf_path: string | null;
    read_time: number;
}

export class SupabaseEstudarRepository implements IEstudarRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async getAll(): Promise<Estudar[]> {
        try {
            const { data, error } = await this.supabase.from("estudar").select("*").order("id", { ascending: false });

            if (error || !data) {
                console.error("Erro ao buscar estudar:", error?.message);
                return [];
            }

            return data
                .filter((row): row is SupabaseEstudarRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row));
        } catch (err) {
            console.error("Erro inesperado ao buscar estudar:", err);
            return [];
        }
    }

    async getById(id: number): Promise<Estudar | null> {
        try {
            const { data, error } = await this.supabase.from("estudar").select("*").eq("id", id).single();

            if (error || !data || !this.isValidRow(data)) return null;
            return this.mapToEntity(data);
        } catch {
            return null;
        }
    }

    async getLatest(): Promise<Estudar | null> {
        try {
            const { data, error } = await this.supabase
                .from("estudar")
                .select("*")
                .order("id", { ascending: false })
                .limit(1)
                .single();

            if (error || !data || !this.isValidRow(data)) return null;
            return this.mapToEntity(data);
        } catch {
            return null;
        }
    }

    private isValidRow(row: unknown): row is SupabaseEstudarRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        return typeof r.id === "number" && typeof r.title === "string";
    }

    private mapToEntity(row: SupabaseEstudarRow): Estudar {
        const props: EstudarProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            title: row.title,
            htmlPath: row.html_path,
            pdfPath: row.pdf_path,
            readTime: row.read_time,
        };
        return Estudar.create(props);
    }
}
