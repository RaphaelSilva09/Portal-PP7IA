/**
 * PostgresContentRepository (Infrastructure Layer)
 *
 * Implementação do repositório de conteúdo usando Postgres direto via `pg` Pool.
 * Suporta múltiplos tipos: newsletter, mini-livro, biblioteca.
 *
 * Princípios aplicados:
 * - Adapter Pattern: Adapta Postgres para interface de domínio
 * - DRY: Uma implementação para múltiplos tipos de conteúdo
 * - Graceful Degradation: Retorna arrays vazios em caso de erro de leitura
 */

import { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import type {
    CreateContentInput,
    IContentRepository,
    UpdateContentInput,
} from "@/domain/repositories/IContentRepository";
import { pool } from "@/lib/db";

/** Mapeamento de tipo de conteúdo para nome da tabela no banco */
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
 * Remove campos com valor undefined do payload antes de enviar ao banco.
 * Mantém o contrato com o schema e evita colunas inesperadas em INSERTs.
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
 * Mapeia uma row do Postgres para ContentItem.
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
        ebookId: isMiniLivro ? (row.ebook_id as number | null) : null,
        partOrder: isMiniLivro ? ((row.part_order as number) ?? 1) : null,
        // Biblioteca-specific fields
        tema: isBiblioteca ? (row.tema as string | null) : null,
        // Ebook-specific fields
        subtitle: isEbook ? (row.subtitle as string | null) : null,
        description: isEbook ? (row.description as string | null) : null,
        badgeText: isEbook ? (row.badge_text as string | null) : null,
        coverImagePath: isEbook ? (row.cover_image_path as string | null) : null,
        coverPdfPath: isEbook ? (row.cover_pdf_path as string | null) : null,
        ebookOrder: isEbook ? (row.order as number | null) : null,
    });
}

export class PostgresContentRepository implements IContentRepository {
    async getAll(type: ContentType): Promise<ContentItem[]> {
        try {
            const table = TABLE_MAP[type];
            const { rows } = await pool.query<Record<string, unknown>>(
                `SELECT * FROM ${table}`,
            );
            const items = rows.map(row => mapRow(type, row));
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
            const { rows } = await pool.query<Record<string, unknown>>(
                `SELECT * FROM ${table} WHERE id = $1 LIMIT 1`,
                [id],
            );
            if (rows.length === 0) return null;
            return mapRow(type, rows[0]);
        } catch {
            return null;
        }
    }

    async getBySlug(type: ContentType, slug: string): Promise<ContentItem | null> {
        try {
            const table = TABLE_MAP[type];
            const pathColumn = type === "ebook" ? "intro_html_path" : "html_path";
            const { rows } = await pool.query<Record<string, unknown>>(
                `SELECT * FROM ${table} WHERE ${pathColumn} LIKE '%/' || $1 || '.html'`,
                [slug],
            );
            // Revalida com a mesma regex usada nos getters de domínio (Newsletter.htmlPath etc.)
            // — o LIKE acima é só um filtro grosseiro, evita falso positivo com "_" (curinga do LIKE).
            const row = rows.find(r => {
                const raw = (r[pathColumn] as string | null)?.trim();
                const match = raw?.match(/\/([^/]+)\.html$/);
                return match?.[1] === slug;
            });
            return row ? mapRow(type, row) : null;
        } catch {
            return null;
        }
    }

    async create(type: ContentType, input: CreateContentInput): Promise<ContentItem> {
        const table = TABLE_MAP[type];

        // Ebook tem colunas extras no banco — montar objeto de insert apropriado.
        // Ebooks: created_at tem DEFAULT now() no banco, não é necessário enviar.
        // Demais tabelas: created_at é NOT NULL sem DEFAULT, deve ser enviado explicitamente.
        const now = (input.createdAt ?? new Date()).toISOString();
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
                      order: input.order,
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
                          ebook_id: input.ebookId ?? null,
                          part_order: input.partOrder ?? 1,
                          created_at: now,
                      }
                    : {
                          title: input.title,
                          read_time: input.readTime ?? null,
                          created_at: now,
                      };

        const insertData = cleanInsertData(rawInsertData);

        const columns = Object.keys(insertData);
        const values = Object.values(insertData);
        // Aspas duplas nas colunas para preservar identificadores reservados (ex: "order").
        const columnList = columns.map(c => `"${c}"`).join(", ");
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

        try {
            const { rows } = await pool.query<Record<string, unknown>>(
                `INSERT INTO ${table} (${columnList}) VALUES (${placeholders}) RETURNING *`,
                values,
            );
            if (rows.length === 0) throw new Error(`Falha ao criar ${type}: nenhum registro retornado`);
            return mapRow(type, rows[0]);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Falha ao criar ${type}: ${message}`);
        }
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

        const columns = Object.keys(updateData);
        const values = Object.values(updateData);

        try {
            // Sem colunas para atualizar: retornar o registro atual.
            if (columns.length === 0) {
                const { rows } = await pool.query<Record<string, unknown>>(
                    `SELECT * FROM ${table} WHERE id = $1 LIMIT 1`,
                    [id],
                );
                if (rows.length === 0) throw new Error(`Falha ao atualizar ${type}: registro não encontrado`);
                return mapRow(type, rows[0]);
            }

            // updated_at manual: só a tabela newsletters tem trigger de auto-update;
            // setar aqui cobre todos os tipos (usado pelo alerta de conteúdo atualizado).
            const setClause = [
                ...columns.map((c, i) => `"${c}" = $${i + 1}`),
                "updated_at = NOW()",
            ].join(", ");
            const idPlaceholder = `$${columns.length + 1}`;
            const { rows } = await pool.query<Record<string, unknown>>(
                `UPDATE ${table} SET ${setClause} WHERE id = ${idPlaceholder} RETURNING *`,
                [...values, id],
            );
            if (rows.length === 0) throw new Error(`Falha ao atualizar ${type}: registro não encontrado`);
            return mapRow(type, rows[0]);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Falha ao atualizar ${type}: ${message}`);
        }
    }

    async delete(type: ContentType, id: number): Promise<void> {
        const table = TABLE_MAP[type];
        try {
            await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Falha ao deletar ${type}: ${message}`);
        }
    }

    async getLastUpdated(type: ContentType): Promise<Date | null> {
        try {
            const table = TABLE_MAP[type];
            const { rows } = await pool.query<{ updated_at: string | null }>(
                `SELECT updated_at FROM ${table} ORDER BY updated_at DESC LIMIT 1`,
            );
            const updatedAt = rows[0]?.updated_at;
            if (!updatedAt) return null;
            return new Date(updatedAt);
        } catch {
            return null;
        }
    }

    async reorderItems(type: ContentType, orderedIds: number[]): Promise<void> {
        if (!INDEXABLE_TYPES.has(type)) return;
        const table = TABLE_MAP[type];
        await Promise.all(
            orderedIds.map((id, i) =>
                pool.query(`UPDATE ${table} SET "index" = $1 WHERE id = $2`, [i + 1, id]),
            ),
        );
    }

    async suppressDigestNotification(type: ContentType, id: number): Promise<void> {
        const table = TABLE_MAP[type];
        try {
            await pool.query(
                `UPDATE public.content_digest_queue
                 SET sent_at = now()
                 WHERE table_name = $1 AND record_id = $2 AND sent_at IS NULL`,
                [table, String(id)],
            );
        } catch (error) {
            console.error(`Falha ao suprimir notificação de digest para ${type}#${id}:`, error);
        }
    }
}
