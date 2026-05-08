import type { SupabaseClient } from "@supabase/supabase-js";
import { MiniLivroSection, type MiniLivroSectionKind, type MiniLivroSectionProps } from "@/domain/entities/MiniLivroSection";
import type { IMiniLivroSectionRepository } from "@/domain/repositories/IMiniLivroSectionRepository";

interface SupabaseMiniLivroSectionRow {
    id: number;
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
    return kind === "prefacio" ? 0 : 1;
}

export class SupabaseMiniLivroSectionRepository implements IMiniLivroSectionRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async getAll(): Promise<MiniLivroSection[]> {
        try {
            const { data, error } = await this.supabase.from("mini_livro_sections").select("*");

            if (error || !data) {
                console.error("Erro ao buscar seções extras dos mini-livros:", error?.message);
                return [];
            }

            return data
                .filter((row): row is SupabaseMiniLivroSectionRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row))
                .sort(compareMiniLivroSections);
        } catch (error) {
            console.error("Erro inesperado ao buscar seções extras dos mini-livros:", error);
            return [];
        }
    }

    async getById(id: number): Promise<MiniLivroSection | null> {
        try {
            const { data, error } = await this.supabase.from("mini_livro_sections").select("*").eq("id", id).single();

            if (error || !data || !this.isValidRow(data)) {
                return null;
            }

            return this.mapToEntity(data);
        } catch {
            return null;
        }
    }

    async getPrefacio(): Promise<MiniLivroSection | null> {
        const items = await this.getByKind("prefacio");
        return items[0] ?? null;
    }

    async getEncerramentos(): Promise<MiniLivroSection[]> {
        return this.getByKind("encerramento");
    }

    async getByKind(kind: MiniLivroSectionKind): Promise<MiniLivroSection[]> {
        try {
            const { data, error } = await this.supabase.from("mini_livro_sections").select("*").eq("kind", kind);

            if (error || !data) {
                console.error(`Erro ao buscar seções do tipo ${kind}:`, error?.message);
                return [];
            }

            return data
                .filter((row): row is SupabaseMiniLivroSectionRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row))
                .sort(compareMiniLivroSections);
        } catch (error) {
            console.error(`Erro inesperado ao buscar seções do tipo ${kind}:`, error);
            return [];
        }
    }

    private isValidRow(row: unknown): row is SupabaseMiniLivroSectionRow {
        if (!row || typeof row !== "object") {
            return false;
        }

        const candidate = row as Record<string, unknown>;
        return (
            typeof candidate.id === "number"
            && typeof candidate.title === "string"
            && (candidate.kind === "prefacio" || candidate.kind === "encerramento")
        );
    }

    private mapToEntity(row: SupabaseMiniLivroSectionRow): MiniLivroSection {
        const props: MiniLivroSectionProps = {
            id: row.id,
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
