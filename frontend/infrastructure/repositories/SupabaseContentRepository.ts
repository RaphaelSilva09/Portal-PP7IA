/**
 * SupabaseContentRepository (Infrastructure Layer)
 *
 * Implementação do repositório de conteúdo usando Supabase.
 * Suporta múltiplos tipos: newsletter, mini-livro, biblioteca.
 *
 * Princípios aplicados:
 * - Adapter Pattern: Adapta Supabase API para interface de domínio
 * - DRY: Uma implementação para múltiplos tipos de conteúdo
 * - Graceful Degradation: Retorna arrays vazios em caso de erro de leitura
 */

import { supabase } from "../config/supabase";
import { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import type {
    IContentRepository,
    CreateContentInput,
    UpdateContentInput,
} from "@/domain/repositories/IContentRepository";

/** Mapeamento de tipo de conteúdo para nome da tabela no Supabase */
const TABLE_MAP: Record<ContentType, string> = {
    newsletter: "newsletters",
    "mini-livro": "mini-livros",
    biblioteca: "biblioteca",
};

export class SupabaseContentRepository implements IContentRepository {
    async getAll(type: ContentType): Promise<ContentItem[]> {
        try {
            const table = TABLE_MAP[type];

            const { data, error } = await supabase
                .from(table)
                .select("*")
                .order("id", { ascending: false });

            if (error || !data) {
                console.error(`Erro ao buscar ${type}:`, error);
                return [];
            }

            return data.map((row) =>
                ContentItem.create({
                    id: row.id,
                    createdAt: new Date(row.created_at),
                    title: row.title,
                    htmlPath: row.html_path,
                    pdfPath: row.pdf_path,
                    readTime: row.read_time,
                })
            );
        } catch (error) {
            console.error(`Erro inesperado ao buscar ${type}:`, error);
            return [];
        }
    }

    async getById(type: ContentType, id: number): Promise<ContentItem | null> {
        try {
            const table = TABLE_MAP[type];

            const { data, error } = await supabase
                .from(table)
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                return null;
            }

            return ContentItem.create({
                id: data.id,
                createdAt: new Date(data.created_at),
                title: data.title,
                htmlPath: data.html_path,
                pdfPath: data.pdf_path,
                readTime: data.read_time,
            });
        } catch {
            return null;
        }
    }

    async create(
        type: ContentType,
        input: CreateContentInput
    ): Promise<ContentItem> {
        const table = TABLE_MAP[type];

        const { data, error } = await supabase
            .from(table)
            .insert({
                title: input.title,
                read_time: input.readTime ?? null,
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error(`Falha ao criar ${type}: ${error?.message}`);
        }

        return ContentItem.create({
            id: data.id,
            createdAt: new Date(data.created_at),
            title: data.title,
            htmlPath: data.html_path,
            pdfPath: data.pdf_path,
            readTime: data.read_time,
        });
    }

    async update(
        type: ContentType,
        id: number,
        input: UpdateContentInput
    ): Promise<ContentItem> {
        const table = TABLE_MAP[type];

        const updateData: Record<string, unknown> = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.readTime !== undefined) updateData.read_time = input.readTime;
        if (input.htmlPath !== undefined) updateData.html_path = input.htmlPath;
        if (input.pdfPath !== undefined) updateData.pdf_path = input.pdfPath;

        const { data, error } = await supabase
            .from(table)
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error || !data) {
            throw new Error(`Falha ao atualizar ${type}: ${error?.message}`);
        }

        return ContentItem.create({
            id: data.id,
            createdAt: new Date(data.created_at),
            title: data.title,
            htmlPath: data.html_path,
            pdfPath: data.pdf_path,
            readTime: data.read_time,
        });
    }

    async delete(type: ContentType, id: number): Promise<void> {
        const table = TABLE_MAP[type];

        const { error } = await supabase.from(table).delete().eq("id", id);

        if (error) {
            throw new Error(`Falha ao deletar ${type}: ${error.message}`);
        }
    }
}
