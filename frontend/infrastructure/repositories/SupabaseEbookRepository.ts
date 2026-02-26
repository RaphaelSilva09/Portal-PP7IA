/**
 * SupabaseEbookRepository (Infrastructure Layer)
 *
 * Implementação concreta do IEbookRepository usando Supabase.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta a API do Supabase para nosso domínio
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Ebook, EbookProps } from "../../domain/entities/Ebook";
import { IEbookRepository } from "../../domain/repositories/IEbookRepository";

interface SupabaseEbookRow {
    id: number;
    created_at: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_path: string | null;
    html_path: string | null;
    pdf_path: string | null;
    read_time: number;
}

export class SupabaseEbookRepository implements IEbookRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async getAll(): Promise<Ebook[]> {
        try {
            const { data, error } = await this.supabase.from("ebooks").select("*").order("id", { ascending: false });

            if (error || !data) {
                console.error("Erro ao buscar ebooks:", error?.message);
                return [];
            }

            return data
                .filter((row): row is SupabaseEbookRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row));
        } catch (err) {
            console.error("Erro inesperado ao buscar ebooks:", err);
            return [];
        }
    }

    async getById(id: number): Promise<Ebook | null> {
        try {
            const { data, error } = await this.supabase.from("ebooks").select("*").eq("id", id).single();

            if (error || !data || !this.isValidRow(data)) return null;
            return this.mapToEntity(data);
        } catch {
            return null;
        }
    }

    async getLatest(): Promise<Ebook | null> {
        try {
            const { data, error } = await this.supabase
                .from("ebooks")
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

    private isValidRow(row: unknown): row is SupabaseEbookRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        return typeof r.id === "number" && typeof r.title === "string";
    }

    private mapToEntity(row: SupabaseEbookRow): Ebook {
        const props: EbookProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            title: row.title,
            subtitle: row.subtitle ?? null,
            description: row.description ?? null,
            coverImagePath: row.cover_image_path ?? null,
            htmlPath: row.html_path,
            pdfPath: row.pdf_path,
            readTime: row.read_time,
        };
        return Ebook.create(props);
    }
}
