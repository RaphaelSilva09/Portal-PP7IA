import { pool } from "@/lib/db";
import { MiniLivroSection, type MiniLivroSectionKind, type MiniLivroSectionProps } from "@/domain/entities/MiniLivroSection";
import type { IMiniLivroSectionRepository } from "@/domain/repositories/IMiniLivroSectionRepository";

interface MiniLivroSectionRow {
    id: number | string; // pg returns BIGINT as string at runtime
    created_at: string;
    updated_at: string;
    kind: MiniLivroSectionKind;
    title: string;
    description: string | null;
    html_path: string | null;
    index: number;
}

function compareMiniLivroSections(left: MiniLivroSection, right: MiniLivroSection): number {
    const kindDifference = getKindOrder(left.kind) - getKindOrder(right.kind);

    if (kindDifference !== 0) {
        return kindDifference;
    }

    const leftHasManualIndex = left.index > 0;
    const rightHasManualIndex = right.index > 0;

    if (leftHasManualIndex && rightHasManualIndex) {
        if (left.index !== right.index) {
            return left.index - right.index;
        }

        return left.id - right.id;
    }

    if (leftHasManualIndex !== rightHasManualIndex) {
        return leftHasManualIndex ? -1 : 1;
    }

    const createdAtDifference = right.createdAt.getTime() - left.createdAt.getTime();

    if (createdAtDifference !== 0) {
        return createdAtDifference;
    }

    return left.id - right.id;
}

function getKindOrder(kind: MiniLivroSectionKind): number {
    return kind === "introducao" ? 0 : 1;
}

export class SupabaseMiniLivroSectionRepository implements IMiniLivroSectionRepository {
    async getAll(): Promise<MiniLivroSection[]> {
        try {
            const { rows } = await pool.query<Record<string, unknown>>(
                `SELECT * FROM mini_livro_sections`,
            );

            return rows
                .filter(row => this.isValidRow(row))
                .map(row => this.mapToEntity(row as unknown as MiniLivroSectionRow))
                .sort(compareMiniLivroSections);
        } catch (error) {
            console.error("Erro inesperado ao buscar seções extras dos mini-livros:", error);
            return [];
        }
    }

    async getById(id: number): Promise<MiniLivroSection | null> {
        try {
            const { rows } = await pool.query<Record<string, unknown>>(
                `SELECT * FROM mini_livro_sections WHERE id = $1 LIMIT 1`,
                [id],
            );

            const data = rows[0] ?? null;
            if (!data || !this.isValidRow(data)) {
                return null;
            }

            return this.mapToEntity(data as unknown as MiniLivroSectionRow);
        } catch {
            return null;
        }
    }

    async getIntroducao(): Promise<MiniLivroSection | null> {
        const items = await this.getByKind("introducao");
        return items[0] ?? null;
    }

    async getEncerramentos(): Promise<MiniLivroSection[]> {
        return this.getByKind("encerramento");
    }

    async getByKind(kind: MiniLivroSectionKind): Promise<MiniLivroSection[]> {
        try {
            const { rows } = await pool.query<Record<string, unknown>>(
                `SELECT * FROM mini_livro_sections WHERE kind = $1`,
                [kind],
            );

            return rows
                .filter(row => this.isValidRow(row))
                .map(row => this.mapToEntity(row as unknown as MiniLivroSectionRow))
                .sort(compareMiniLivroSections);
        } catch (error) {
            console.error(`Erro inesperado ao buscar seções do tipo ${kind}:`, error);
            return [];
        }
    }

    private isValidRow(row: unknown): row is MiniLivroSectionRow {
        if (!row || typeof row !== "object") {
            return false;
        }

        const candidate = row as Record<string, unknown>;
        const idOk = (typeof candidate.id === "number" || typeof candidate.id === "string") && !isNaN(Number(candidate.id));
        return (
            idOk
            && typeof candidate.title === "string"
            && (candidate.kind === "introducao" || candidate.kind === "encerramento")
        );
    }

    private mapToEntity(row: MiniLivroSectionRow): MiniLivroSection {
        const props: MiniLivroSectionProps = {
            id: Number(row.id),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            kind: row.kind,
            title: row.title,
            description: row.description ?? null,
            htmlPath: row.html_path ?? null,
            index: row.index ?? 0,
        };

        return MiniLivroSection.create(props);
    }
}
