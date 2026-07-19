/**
 * PostgresBookRepository (Infrastructure Layer)
 *
 * Implementação do repositório do Livro Principal (singleton ativo)
 * usando Postgres direto via `pg` Pool.
 *
 * Princípios aplicados:
 * - Adapter Pattern: Adapta Postgres para interface de domínio
 * - Graceful Degradation: Retorna null quando não há livro ativo
 */

import { Book } from "../../domain/entities/Book";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { pool } from "../../lib/db";

export class PostgresBookRepository implements IBookRepository {
    async getActiveBook(): Promise<Book | null> {
        try {
            const { rows } = await pool.query<Record<string, unknown>>(
                `SELECT * FROM book WHERE is_active = $1 LIMIT 1`,
                [true],
            );
            const data = rows[0] ?? null;
            if (!data) return null; // Não encontrou nenhum registro

            return Book.create({
                id: data.id as number,
                title: data.title as string,
                subtitle: (data.subtitle as string | null) ?? null,
                description: (data.description as string | null) ?? null,
                coverImagePath: (data.cover_image_path as string | null) ?? null,
                coverPdfPath: (data.cover_pdf_path as string | null) ?? null,
                introHtmlPath: (data.intro_html_path as string | null) ?? null,
                introPdfPath: (data.intro_pdf_path as string | null) ?? null,
                badgeText: (data.badge_text as string | null) ?? null,
                isActive: (data.is_active as boolean | null) ?? false,
            });
        } catch (error) {
            console.error("Unexpected error in PostgresBookRepository.getActiveBook:", error);
            throw error;
        }
    }
}
