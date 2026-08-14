import { pool } from "../../lib/db";
import type { ReadingTrailItemRef, ReadingTrailRecord, ReadingTrailSummary } from "../../domain/entities/ReadingTrail";
import type {
    CreateReadingTrailInput,
    IReadingTrailRepository,
    UpdateReadingTrailInput,
} from "../../domain/repositories/IReadingTrailRepository";

interface TrailRow {
    id: number;
    slug: string;
    title: string;
    description: string;
    cover_image_path: string | null;
    published: boolean;
    created_at: Date;
    updated_at: Date;
}

interface ItemRow {
    content_type: string;
    content_id: string;
    position: number;
}

function mapTrail(row: TrailRow, items: ItemRow[]): ReadingTrailRecord {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        coverImagePath: row.cover_image_path,
        published: row.published,
        items: items.map(i => ({ contentType: i.content_type, contentId: i.content_id, position: i.position } satisfies ReadingTrailItemRef)),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

async function getItems(trailId: number): Promise<ItemRow[]> {
    const { rows } = await pool.query<ItemRow>(
        `SELECT content_type, content_id, position FROM public.reading_trail_items WHERE trail_id = $1 ORDER BY position ASC`,
        [trailId],
    );
    return rows;
}

export class PostgresReadingTrailRepository implements IReadingTrailRepository {
    async getAllForAdmin(): Promise<ReadingTrailRecord[]> {
        try {
            const { rows } = await pool.query<TrailRow>(`SELECT * FROM public.reading_trails ORDER BY created_at DESC`);
            return Promise.all(rows.map(async row => mapTrail(row, await getItems(row.id))));
        } catch (err) {
            console.error("Erro ao listar trilhas de leitura:", err);
            return [];
        }
    }

    async getByIdForAdmin(id: number): Promise<ReadingTrailRecord | null> {
        try {
            const { rows } = await pool.query<TrailRow>(`SELECT * FROM public.reading_trails WHERE id = $1 LIMIT 1`, [id]);
            const row = rows[0];
            return row ? mapTrail(row, await getItems(row.id)) : null;
        } catch (err) {
            console.error(`Erro ao buscar trilha ${id}:`, err);
            return null;
        }
    }

    async create(input: CreateReadingTrailInput): Promise<ReadingTrailRecord> {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const { rows } = await client.query<TrailRow>(
                `INSERT INTO public.reading_trails (slug, title, description, cover_image_path, published)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [input.slug, input.title, input.description ?? "", input.coverImagePath ?? null, input.published ?? false],
            );
            const trail = rows[0];

            for (const [index, item] of input.items.entries()) {
                await client.query(
                    `INSERT INTO public.reading_trail_items (trail_id, content_type, content_id, position)
                     VALUES ($1, $2, $3, $4)`,
                    [trail.id, item.contentType, item.contentId, index],
                );
            }

            await client.query("COMMIT");
            return mapTrail(trail, await getItems(trail.id));
        } catch (err) {
            await client.query("ROLLBACK");
            throw err instanceof Error ? err : new Error(String(err));
        } finally {
            client.release();
        }
    }

    async update(id: number, input: UpdateReadingTrailInput): Promise<ReadingTrailRecord | null> {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const { rows } = await client.query<TrailRow>(
                `UPDATE public.reading_trails
                 SET slug = COALESCE($2, slug),
                     title = COALESCE($3, title),
                     description = COALESCE($4, description),
                     cover_image_path = CASE WHEN $5::boolean THEN $6 ELSE cover_image_path END,
                     published = COALESCE($7, published)
                 WHERE id = $1
                 RETURNING *`,
                [
                    id,
                    input.slug ?? null,
                    input.title ?? null,
                    input.description ?? null,
                    input.coverImagePath !== undefined,
                    input.coverImagePath ?? null,
                    input.published ?? null,
                ],
            );
            const trail = rows[0];
            if (!trail) {
                await client.query("ROLLBACK");
                return null;
            }

            if (input.items) {
                await client.query(`DELETE FROM public.reading_trail_items WHERE trail_id = $1`, [id]);
                for (const [index, item] of input.items.entries()) {
                    await client.query(
                        `INSERT INTO public.reading_trail_items (trail_id, content_type, content_id, position)
                         VALUES ($1, $2, $3, $4)`,
                        [id, item.contentType, item.contentId, index],
                    );
                }
            }

            await client.query("COMMIT");
            return mapTrail(trail, await getItems(id));
        } catch (err) {
            await client.query("ROLLBACK");
            throw err instanceof Error ? err : new Error(String(err));
        } finally {
            client.release();
        }
    }

    async delete(id: number): Promise<boolean> {
        const { rowCount } = await pool.query(`DELETE FROM public.reading_trails WHERE id = $1`, [id]);
        return (rowCount ?? 0) > 0;
    }

    async getPublishedSummaries(): Promise<ReadingTrailSummary[]> {
        try {
            const { rows } = await pool.query<TrailRow & { item_count: number }>(
                `SELECT t.*, COUNT(i.id)::int AS item_count
                 FROM public.reading_trails t
                 LEFT JOIN public.reading_trail_items i ON i.trail_id = t.id
                 WHERE t.published = TRUE
                 GROUP BY t.id
                 ORDER BY t.created_at DESC`,
            );
            return rows.map(row => ({
                slug: row.slug,
                title: row.title,
                description: row.description,
                coverImagePath: row.cover_image_path,
                itemCount: row.item_count,
            }));
        } catch (err) {
            console.error("Erro ao listar trilhas publicadas:", err);
            return [];
        }
    }

    async getBySlug(slug: string): Promise<ReadingTrailRecord | null> {
        try {
            const { rows } = await pool.query<TrailRow>(`SELECT * FROM public.reading_trails WHERE slug = $1 LIMIT 1`, [slug]);
            const row = rows[0];
            return row ? mapTrail(row, await getItems(row.id)) : null;
        } catch (err) {
            console.error(`Erro ao buscar trilha "${slug}":`, err);
            return null;
        }
    }

    async getCompletedKeys(userId: string, trailId: number): Promise<Set<string>> {
        try {
            const { rows } = await pool.query<{ content_type: string; content_id: string }>(
                `SELECT content_type, content_id FROM public.reading_trail_progress WHERE user_id = $1 AND trail_id = $2`,
                [userId, trailId],
            );
            return new Set(rows.map(r => `${r.content_type}|${r.content_id}`));
        } catch (err) {
            console.error("Erro ao buscar progresso da trilha:", err);
            return new Set();
        }
    }

    async markProgress(userId: string, contentType: string, contentId: string): Promise<void> {
        try {
            await pool.query(
                `INSERT INTO public.reading_trail_progress (user_id, trail_id, content_type, content_id)
                 SELECT $1, rti.trail_id, rti.content_type, rti.content_id
                 FROM public.reading_trail_items rti
                 WHERE rti.content_type = $2 AND rti.content_id = $3
                 ON CONFLICT (user_id, trail_id, content_type, content_id) DO NOTHING`,
                [userId, contentType, contentId],
            );
        } catch (err) {
            console.error("Erro ao marcar progresso da trilha:", err);
        }
    }
}
