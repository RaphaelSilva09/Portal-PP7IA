/**
 * SupabaseRadarOportunidadesRepository (Infrastructure Layer)
 *
 * Implementação concreta do IRadarOportunidadesRepository usando Supabase.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta a API do Supabase para nosso domínio
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { RadarOportunidades, RadarOportunidadesProps } from "../../domain/entities/RadarOportunidades";
import { IRadarOportunidadesRepository } from "../../domain/repositories/IRadarOportunidadesRepository";

interface SupabaseRadarRow {
    id: number;
    created_at: string;
    title: string;
    html_path: string | null;
    pdf_path: string | null;
    read_time: number;
    index: number;
}

export class SupabaseRadarOportunidadesRepository implements IRadarOportunidadesRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async getAll(): Promise<RadarOportunidades[]> {
        try {
            const { data, error } = await this.supabase.from("radar_oportunidades").select("*");

            if (error || !data) {
                console.error("Erro ao buscar radar_oportunidades:", error?.message);
                return [];
            }

            const items = data
                .filter((row): row is SupabaseRadarRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row));
            return this.sortByIndex(items);
        } catch (err) {
            console.error("Erro inesperado ao buscar radar_oportunidades:", err);
            return [];
        }
    }

    async getById(id: number): Promise<RadarOportunidades | null> {
        try {
            const { data, error } = await this.supabase.from("radar_oportunidades").select("*").eq("id", id).single();

            if (error || !data || !this.isValidRow(data)) return null;
            return this.mapToEntity(data);
        } catch {
            return null;
        }
    }

    async getLatest(): Promise<RadarOportunidades | null> {
        try {
            const all = await this.getAll();
            return all[0] ?? null;
        } catch {
            return null;
        }
    }

    private isValidRow(row: unknown): row is SupabaseRadarRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        return typeof r.id === "number" && typeof r.title === "string";
    }

    private mapToEntity(row: SupabaseRadarRow): RadarOportunidades {
        const props: RadarOportunidadesProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            title: row.title,
            htmlPath: row.html_path,
            pdfPath: row.pdf_path,
            readTime: row.read_time,
            index: row.index ?? 0,
        };
        return RadarOportunidades.create(props);
    }

    private sortByIndex(items: RadarOportunidades[]): RadarOportunidades[] {
        const indexed = items.filter(i => i.index > 0).sort((a, b) => a.index - b.index);
        const unindexed = items.filter(i => i.index === 0).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return [...indexed, ...unindexed];
    }
}
