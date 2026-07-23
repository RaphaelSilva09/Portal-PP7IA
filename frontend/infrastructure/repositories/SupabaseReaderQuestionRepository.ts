import { pool } from "../../lib/db";
import { ReaderQuestion, ReaderQuestionProps, ReaderQuestionStatus } from "../../domain/entities/ReaderQuestion";
import { IReaderQuestionRepository } from "../../domain/repositories/IReaderQuestionRepository";

interface ReaderQuestionRow {
    id: number;
    created_at: string;
    updated_at?: string | null;
    user_id: string;
    user_email?: string | null;
    question: string;
    status: ReaderQuestionStatus;
}

export class SupabaseReaderQuestionRepository implements IReaderQuestionRepository {
    async getAll(): Promise<ReaderQuestion[]> {
        try {
            const { rows } = await pool.query(
                `SELECT rq.*, u.email AS user_email
                 FROM reader_questions rq
                 LEFT JOIN "user" u ON u.id = rq.user_id
                 ORDER BY rq.created_at DESC`,
            );
            return (rows as ReaderQuestionRow[]).map(row => this.mapToEntity(row));
        } catch (err) {
            console.error("Erro ao buscar perguntas dos leitores:", err);
            return [];
        }
    }

    async getByUser(userId: string): Promise<ReaderQuestion[]> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM reader_questions WHERE user_id = $1 ORDER BY created_at DESC`,
                [userId],
            );
            return (rows as ReaderQuestionRow[]).map(row => this.mapToEntity(row));
        } catch (err) {
            console.error(`Erro ao buscar perguntas do usuário ${userId}:`, err);
            return [];
        }
    }

    async create(userId: string, question: string): Promise<ReaderQuestion> {
        const { rows } = await pool.query(
            `INSERT INTO reader_questions (user_id, question) VALUES ($1, $2) RETURNING *`,
            [userId, question],
        );
        return this.mapToEntity(rows[0] as ReaderQuestionRow);
    }

    async updateStatus(id: number, status: ReaderQuestionStatus): Promise<ReaderQuestion | null> {
        const { rows } = await pool.query(
            `UPDATE reader_questions SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id],
        );
        const row = rows[0] as ReaderQuestionRow | undefined;
        return row ? this.mapToEntity(row) : null;
    }

    private mapToEntity(row: ReaderQuestionRow): ReaderQuestion {
        const props: ReaderQuestionProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            updatedAt: row.updated_at ? new Date(row.updated_at) : null,
            userId: row.user_id,
            userEmail: row.user_email ?? null,
            question: row.question,
            status: row.status,
        };
        return ReaderQuestion.create(props);
    }
}
