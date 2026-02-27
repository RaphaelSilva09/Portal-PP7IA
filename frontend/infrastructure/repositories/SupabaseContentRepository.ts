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

import { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import type {
    CreateContentInput,
    IContentRepository,
    UpdateContentInput,
} from "@/domain/repositories/IContentRepository";
import { supabase } from "../config/supabase";

/** Mapeamento de tipo de conteúdo para nome da tabela no Supabase */
const TABLE_MAP: Record<ContentType, string> = {
    newsletter: "newsletters",
    "mini-livro": "mini_livros",
    biblioteca: "biblioteca",
    "especial-semana": "especial_semana",
    radar_oportunidades: "radar_oportunidades",
    estudar: "estudar",
    ebook: "ebooks",
};

/**
 * Mapeia uma row do Supabase para ContentItem.
 * Para ebook: intro_html_path → htmlPath, intro_pdf_path → pdfPath.
 * Para demais tipos: html_path → htmlPath, pdf_path → pdfPath.
 */
function mapRow(type: ContentType, row: Record<string, unknown>): ContentItem {
    const isEbook = type === "ebook";
    return ContentItem.create({
        id: row.id as number,
        createdAt: new Date(row.created_at as string),
        title: row.title as string,
        htmlPath: isEbook ? (row.intro_html_path as string | null) : (row.html_path as string | null),
        pdfPath: isEbook ? (row.intro_pdf_path as string | null) : (row.pdf_path as string | null),
        readTime: row.read_time as number,
        // Ebook-specific fields
        subtitle: isEbook ? (row.subtitle as string | null) : null,
        description: isEbook ? (row.description as string | null) : null,
        badgeText: isEbook ? (row.badge_text as string | null) : null,
        coverImagePath: isEbook ? (row.cover_image_path as string | null) : null,
        coverPdfPath: isEbook ? (row.cover_pdf_path as string | null) : null,
    });
}

export class SupabaseContentRepository implements IContentRepository {
    async getAll(type: ContentType): Promise<ContentItem[]> {
        try {
            const table = TABLE_MAP[type];
            const { data, error } = await supabase.from(table).select("*").order("id", { ascending: false });
            if (error || !data) {
                console.error(`Erro ao buscar ${type}:`, error);
                return [];
            }
            return data.map(row => mapRow(type, row));
        } catch (error) {
            console.error(`Erro inesperado ao buscar ${type}:`, error);
            return [];
        }
    }

    async getById(type: ContentType, id: number): Promise<ContentItem | null> {
        try {
            const table = TABLE_MAP[type];
            const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
            if (error || !data) return null;
            return mapRow(type, data);
        } catch {
            return null;
        }
    }

    async create(type: ContentType, input: CreateContentInput): Promise<ContentItem> {
        const table = TABLE_MAP[type];

        // Ebook tem colunas extras no banco — montar objeto de insert apropriado
        const insertData: Record<string, unknown> =
            type === "ebook"
                ? {
                      title: input.title,
                      read_time: input.readTime ?? null,
                      subtitle: input.subtitle ?? null,
                      description: input.description ?? null,
                      badge_text: input.badgeText ?? null,
                      cover_image_path: input.coverImagePath ?? null,
                      cover_pdf_path: input.coverPdfPath ?? null,
                  }
                : {
                      title: input.title,
                      read_time: input.readTime ?? null,
                  };

        const { data, error } = await supabase.from(table).insert(insertData).select().single();
        if (error || !data) throw new Error(`Falha ao criar ${type}: ${error?.message}`);
        return mapRow(type, data);
    }

    async update(type: ContentType, id: number, input: UpdateContentInput): Promise<ContentItem> {
        const table = TABLE_MAP[type];
        const updateData: Record<string, unknown> = {};

        if (input.title !== undefined) updateData.title = input.title;
        if (input.readTime !== undefined) updateData.read_time = input.readTime;

        if (type === "ebook") {
            // Ebook usa colunas específicas no banco
            if (input.htmlPath !== undefined) updateData.intro_html_path = input.htmlPath;
            if (input.pdfPath !== undefined) updateData.intro_pdf_path = input.pdfPath;
            if (input.subtitle !== undefined) updateData.subtitle = input.subtitle;
            if (input.description !== undefined) updateData.description = input.description;
            if (input.badgeText !== undefined) updateData.badge_text = input.badgeText;
            if (input.coverImagePath !== undefined) updateData.cover_image_path = input.coverImagePath;
            if (input.coverPdfPath !== undefined) updateData.cover_pdf_path = input.coverPdfPath;
        } else {
            if (input.htmlPath !== undefined) updateData.html_path = input.htmlPath;
            if (input.pdfPath !== undefined) updateData.pdf_path = input.pdfPath;
        }

        const { data, error } = await supabase.from(table).update(updateData).eq("id", id).select().single();
        if (error || !data) throw new Error(`Falha ao atualizar ${type}: ${error?.message}`);
        return mapRow(type, data);
    }

    async delete(type: ContentType, id: number): Promise<void> {
        const table = TABLE_MAP[type];
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw new Error(`Falha ao deletar ${type}: ${error.message}`);
    }
}
