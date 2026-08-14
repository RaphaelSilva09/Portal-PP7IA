import { pool } from "../../lib/db";
import type { SavedContentEntry } from "../../domain/entities/SavedContent";
import type { ISavedContentRepository } from "../../domain/repositories/ISavedContentRepository";

export class PostgresSavedContentRepository implements ISavedContentRepository {
    async toggle(userId: string, contentType: string, contentId: string): Promise<boolean> {
        const { rows } = await pool.query(
            `SELECT 1 FROM saved_content WHERE user_id = $1 AND content_type = $2 AND content_id = $3`,
            [userId, contentType, contentId],
        );

        if (rows.length > 0) {
            await pool.query(
                `DELETE FROM saved_content WHERE user_id = $1 AND content_type = $2 AND content_id = $3`,
                [userId, contentType, contentId],
            );
            return false;
        }

        await pool.query(
            `INSERT INTO saved_content (user_id, content_type, content_id)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, content_type, content_id) DO NOTHING`,
            [userId, contentType, contentId],
        );
        return true;
    }

    async isSaved(userId: string, contentType: string, contentId: string): Promise<boolean> {
        try {
            const { rows } = await pool.query(
                `SELECT 1 FROM saved_content WHERE user_id = $1 AND content_type = $2 AND content_id = $3`,
                [userId, contentType, contentId],
            );
            return rows.length > 0;
        } catch (err) {
            console.error("Erro ao verificar conteúdo salvo:", err);
            return false;
        }
    }

    async listByUser(userId: string): Promise<SavedContentEntry[]> {
        try {
            const { rows } = await pool.query(
                `SELECT content_type, content_id, created_at FROM saved_content
                 WHERE user_id = $1
                 ORDER BY created_at DESC`,
                [userId],
            );
            return (rows as { content_type: string; content_id: string; created_at: Date }[]).map(r => ({
                contentType: r.content_type,
                contentId: r.content_id,
                createdAt: r.created_at,
            }));
        } catch (err) {
            console.error("Erro ao listar conteúdos salvos:", err);
            return [];
        }
    }
}
