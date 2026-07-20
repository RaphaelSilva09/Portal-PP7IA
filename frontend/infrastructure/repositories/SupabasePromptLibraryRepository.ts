import { pool } from "../../lib/db";
import { PromptLibraryItem, PromptLibraryItemProps } from "../../domain/entities/PromptLibraryItem";
import {
    CreatePromptLibraryItemInput,
    IPromptLibraryRepository,
    UpdatePromptLibraryItemInput,
} from "../../domain/repositories/IPromptLibraryRepository";

interface PromptLibraryRow {
    id: number;
    created_at: string;
    updated_at?: string | null;
    ai_tool: string;
    title: string;
    prompt_body: string;
    use_case: string;
    is_gated: boolean;
    sort_order: number;
}

export class SupabasePromptLibraryRepository implements IPromptLibraryRepository {
    async getAll(): Promise<PromptLibraryItem[]> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM prompt_library ORDER BY sort_order ASC, created_at DESC`,
            );
            return (rows as PromptLibraryRow[]).map(row => this.mapToEntity(row));
        } catch (err) {
            console.error("Erro ao buscar biblioteca de prompts:", err);
            return [];
        }
    }

    async getById(id: number): Promise<PromptLibraryItem | null> {
        try {
            const { rows } = await pool.query(`SELECT * FROM prompt_library WHERE id = $1 LIMIT 1`, [id]);
            const row = rows[0] as PromptLibraryRow | undefined;
            return row ? this.mapToEntity(row) : null;
        } catch (err) {
            console.error(`Erro ao buscar prompt ${id}:`, err);
            return null;
        }
    }

    async create(input: CreatePromptLibraryItemInput): Promise<PromptLibraryItem> {
        const { rows } = await pool.query(
            `INSERT INTO prompt_library (ai_tool, title, prompt_body, use_case, is_gated, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [input.aiTool, input.title, input.promptBody, input.useCase, input.isGated, input.sortOrder ?? 0],
        );
        return this.mapToEntity(rows[0] as PromptLibraryRow);
    }

    async update(id: number, input: UpdatePromptLibraryItemInput): Promise<PromptLibraryItem | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let i = 1;

        const columnByKey: Record<string, string> = {
            aiTool: "ai_tool",
            title: "title",
            promptBody: "prompt_body",
            useCase: "use_case",
            isGated: "is_gated",
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
        const { rows } = await pool.query(
            `UPDATE prompt_library SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
            values,
        );
        const row = rows[0] as PromptLibraryRow | undefined;
        return row ? this.mapToEntity(row) : null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await pool.query(`DELETE FROM prompt_library WHERE id = $1`, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    private mapToEntity(row: PromptLibraryRow): PromptLibraryItem {
        const props: PromptLibraryItemProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            updatedAt: row.updated_at ? new Date(row.updated_at) : null,
            aiTool: row.ai_tool,
            title: row.title,
            promptBody: row.prompt_body,
            useCase: row.use_case,
            isGated: row.is_gated,
            sortOrder: row.sort_order,
        };
        return PromptLibraryItem.create(props);
    }
}
