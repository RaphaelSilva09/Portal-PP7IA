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

/** Tipos que possuem coluna index para ordenação manual */
const INDEXABLE_TYPES = new Set<ContentType>(["newsletter", "mini-livro", "biblioteca", "especial-semana", "radar_oportunidades", "estudar"]);

/**
 * Remove campos com valor undefined do payload antes de enviar ao Supabase.
 * Evita erros PGRST204 por campos não reconhecidos e mantém o contrato com o schema.
 *
 * Princípio aplicado:
 * - Defensive Programming: payload limpo antes de qualquer operação de escrita
 */
function cleanInsertData(data: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
}

/**
 * Ordena itens por index: index > 0 crescente primeiro, index = 0 por created_at DESC.
 */
function sortByIndex(items: ContentItem[]): ContentItem[] {
    const indexed = items.filter(i => i.index > 0).sort((a, b) => a.index - b.index);
    const unindexed = items.filter(i => i.index === 0).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return [...indexed, ...unindexed];
}

/**
 * Mapeia uma row do Supabase para ContentItem.
 * Para ebook: intro_html_path → htmlPath, intro_pdf_path → pdfPath.
 * Para demais tipos: html_path → htmlPath, pdf_path → pdfPath.
 */
function mapRow(type: ContentType, row: Record<string, unknown>): ContentItem {
    const isEbook = type === "ebook";
    const isBiblioteca = type === "biblioteca";
    const isMiniLivro = type === "mini-livro";
    return ContentItem.create({
        id: row.id as number,
        createdAt: new Date(row.created_at as string),
        title: row.title as string,
        htmlPath: isEbook ? (row.intro_html_path as string | null) : (row.html_path as string | null),
        pdfPath: isEbook ? (row.intro_pdf_path as string | null) : (row.pdf_path as string | null),
        readTime: row.read_time as number,
        index: (row.index as number) ?? 0,
        // MiniLivro-specific fields
        relativeEbook: isMiniLivro ? (row.relative_ebook as number | null) : null,
        // Biblioteca-specific fields
        tema: isBiblioteca ? (row.tema as string | null) : null,
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
            const { data, error } = await supabase.from(table).select("*");
            if (error || !data) {
                console.error(`Erro ao buscar ${type}:`, error);
                return [];
            }
            const items = data.map(row => mapRow(type, row));
            if (INDEXABLE_TYPES.has(type)) return sortByIndex(items);
            // ebook: sem coluna index, ordenar por id DESC
            return items.sort((a, b) => b.id - a.id);
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

        // Ebook tem colunas extras no banco — montar objeto de insert apropriado.
        // Ebooks: created_at tem DEFAULT now() no banco, não é necessário enviar.
        // Demais tabelas: created_at é NOT NULL sem DEFAULT, deve ser enviado explicitamente.
        const now = new Date().toISOString();
        const rawInsertData: Record<string, unknown> =
            type === "ebook"
                ? {
                      title: input.title,
                      read_time: input.readTime ?? null,
                      subtitle: input.subtitle ?? null,
                      description: input.description ?? null,
                      badge_text: input.badgeText ?? null,
                      cover_image_path: input.coverImagePath ?? null,
                      cover_pdf_path: input.coverPdfPath ?? null,
                      // created_at omitido: DEFAULT now() no banco
                  }
                : type === "biblioteca"
                  ? {
                        title: input.title,
                        read_time: input.readTime ?? null,
                        tema: input.tema ?? "diversos",
                        created_at: now,
                    }
                  : type === "mini-livro"
                    ? {
                          title: input.title,
                          read_time: input.readTime ?? null,
                          relative_ebook: input.relativeEbook ?? null,
                          created_at: now,
                      }
                    : {
                          title: input.title,
                          read_time: input.readTime ?? null,
                          created_at: now,
                      };

        const insertData = cleanInsertData(rawInsertData);

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
        } else if (type === "biblioteca") {
            if (input.htmlPath !== undefined) updateData.html_path = input.htmlPath;
            if (input.pdfPath !== undefined) updateData.pdf_path = input.pdfPath;
            if (input.tema !== undefined) updateData.tema = input.tema;
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

    async getLastUpdated(type: ContentType): Promise<Date | null> {
        try {
            const table = TABLE_MAP[type];
            const { data, error } = await supabase
                .from(table)
                .select("updated_at")
                .order("updated_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            if (error || !data?.updated_at) return null;
            return new Date(data.updated_at);
        } catch {
            return null;
        }
    }

    async reorderItems(type: ContentType, orderedIds: number[]): Promise<void> {
        if (!INDEXABLE_TYPES.has(type)) return;
        const table = TABLE_MAP[type];
        await Promise.all(
            orderedIds.map((id, i) => supabase.from(table).update({ index: i + 1 }).eq("id", id))
        );
    }
}
