import { pool } from "../../lib/db";
import { emptyReactionCounts, ReactionCounts, ReactionType } from "../../domain/entities/ContentReaction";
import { IContentReactionRepository, TopReactedContent } from "../../domain/repositories/IContentReactionRepository";

export class PostgresContentReactionRepository implements IContentReactionRepository {
    async toggle(userId: string, contentType: string, contentId: string, reaction: ReactionType): Promise<ReactionType | null> {
        const { rows: existingRows } = await pool.query(
            `SELECT reaction FROM content_reactions WHERE user_id = $1 AND content_type = $2 AND content_id = $3`,
            [userId, contentType, contentId],
        );
        const existing = existingRows[0]?.reaction as ReactionType | undefined;

        if (existing === reaction) {
            await pool.query(
                `DELETE FROM content_reactions WHERE user_id = $1 AND content_type = $2 AND content_id = $3`,
                [userId, contentType, contentId],
            );
            return null;
        }

        await pool.query(
            `INSERT INTO content_reactions (user_id, content_type, content_id, reaction)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, content_type, content_id)
             DO UPDATE SET reaction = EXCLUDED.reaction, created_at = NOW()`,
            [userId, contentType, contentId, reaction],
        );
        return reaction;
    }

    async getCounts(contentType: string, contentId: string): Promise<ReactionCounts> {
        try {
            const { rows } = await pool.query(
                `SELECT reaction, COUNT(*)::int AS count FROM content_reactions
                 WHERE content_type = $1 AND content_id = $2
                 GROUP BY reaction`,
                [contentType, contentId],
            );
            const counts = emptyReactionCounts();
            for (const row of rows as { reaction: ReactionType; count: number }[]) {
                counts[row.reaction] = row.count;
            }
            return counts;
        } catch (err) {
            console.error("Erro ao buscar contagem de reações:", err);
            return emptyReactionCounts();
        }
    }

    async getUserReaction(userId: string, contentType: string, contentId: string): Promise<ReactionType | null> {
        try {
            const { rows } = await pool.query(
                `SELECT reaction FROM content_reactions WHERE user_id = $1 AND content_type = $2 AND content_id = $3`,
                [userId, contentType, contentId],
            );
            return (rows[0]?.reaction as ReactionType | undefined) ?? null;
        } catch (err) {
            console.error("Erro ao buscar reação do usuário:", err);
            return null;
        }
    }

    async getTopReacted(limit: number): Promise<TopReactedContent[]> {
        try {
            const { rows } = await pool.query(
                `SELECT content_type, content_id, reaction, COUNT(*)::int AS count
                 FROM content_reactions
                 GROUP BY content_type, content_id, reaction`,
            );

            const byContent = new Map<string, TopReactedContent>();
            for (const row of rows as { content_type: string; content_id: string; reaction: ReactionType; count: number }[]) {
                const key = `${row.content_type}::${row.content_id}`;
                if (!byContent.has(key)) {
                    byContent.set(key, { contentType: row.content_type, contentId: row.content_id, counts: emptyReactionCounts(), total: 0 });
                }
                const entry = byContent.get(key)!;
                entry.counts[row.reaction] = row.count;
                entry.total += row.count;
            }

            return Array.from(byContent.values())
                .sort((a, b) => b.total - a.total)
                .slice(0, limit);
        } catch (err) {
            console.error("Erro ao buscar conteúdos mais reagidos:", err);
            return [];
        }
    }
}
