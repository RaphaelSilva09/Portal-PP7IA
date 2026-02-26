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
}

export class SupabaseRadarOportunidadesRepository implements IRadarOportunidadesRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async getAll(): Promise<RadarOportunidades[]> {
        try {
            const { data, error } = await this.supabase
                .from("radar_oportunidades")
                .select("*")
                .order("id", { ascending: false });

            if (error || !data) {
                console.error("Erro ao buscar radar_oportunidades:", error?.message);
                return [];
            }

            return data
                .filter((row): row is SupabaseRadarRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row));
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
            const { data, error } = await this.supabase
                .from("radar_oportunidades")
                .select("*")
                .order("id", { ascending: false })
                .limit(1)
                .single();

            if (error || !data || !this.isValidRow(data)) return null;
            return this.mapToEntity(data);
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
        };
        return RadarOportunidades.create(props);
    }
}
