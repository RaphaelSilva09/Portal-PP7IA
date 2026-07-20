import { pool } from "../../lib/db";
import { FaqItem, FaqItemProps } from "../../domain/entities/FaqItem";
import { CreateFaqItemInput, IFaqRepository, UpdateFaqItemInput } from "../../domain/repositories/IFaqRepository";

interface FaqRow {
    id: number;
    created_at: string;
    updated_at?: string | null;
    question: string;
    answer: string;
    category: string;
    sort_order: number;
}

export class SupabaseFaqRepository implements IFaqRepository {
    async getAll(): Promise<FaqItem[]> {
        try {
            const { rows } = await pool.query(`SELECT * FROM faq_items ORDER BY sort_order ASC, created_at ASC`);
            return (rows as FaqRow[]).map(row => this.mapToEntity(row));
        } catch (err) {
            console.error("Erro ao buscar FAQ:", err);
            return [];
        }
    }

    async getById(id: number): Promise<FaqItem | null> {
        try {
            const { rows } = await pool.query(`SELECT * FROM faq_items WHERE id = $1 LIMIT 1`, [id]);
            const row = rows[0] as FaqRow | undefined;
            return row ? this.mapToEntity(row) : null;
        } catch (err) {
            console.error(`Erro ao buscar FAQ ${id}:`, err);
            return null;
        }
    }

    async create(input: CreateFaqItemInput): Promise<FaqItem> {
        const { rows } = await pool.query(
            `INSERT INTO faq_items (question, answer, category, sort_order) VALUES ($1, $2, $3, $4) RETURNING *`,
            [input.question, input.answer, input.category ?? "", input.sortOrder ?? 0],
        );
        return this.mapToEntity(rows[0] as FaqRow);
    }

    async update(id: number, input: UpdateFaqItemInput): Promise<FaqItem | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let i = 1;

        const columnByKey: Record<string, string> = {
            question: "question",
            answer: "answer",
            category: "category",
            sortOrder: "sort_order",
        };

        for (const [key, column] of Object.entries(columnByKey)) {
            const value = (input as Record<string, unknown>)[key];
            if (value !== undefined) {
                fields.push(`${column} = $${i}`);
                values.push(value);
                i++;
            }
        }

        if (fields.length === 0) {
            return this.getById(id);
        }

        values.push(id);
        const { rows } = await pool.query(`UPDATE faq_items SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`, values);
        const row = rows[0] as FaqRow | undefined;
        return row ? this.mapToEntity(row) : null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await pool.query(`DELETE FROM faq_items WHERE id = $1`, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    private mapToEntity(row: FaqRow): FaqItem {
        const props: FaqItemProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            updatedAt: row.updated_at ? new Date(row.updated_at) : null,
            question: row.question,
            answer: row.answer,
            category: row.category,
            sortOrder: row.sort_order,
        };
        return FaqItem.create(props);
    }
}
