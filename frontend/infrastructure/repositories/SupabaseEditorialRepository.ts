/**
 * SupabaseEditorialRepository (Infrastructure Layer)
 *
 * Implementação concreta do IEditorialRepository usando Supabase.
 * Tabela singleton: id = 1 sempre; usa upsert para salvar.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Editorial } from "../../domain/entities/Editorial";
import { IEditorialRepository } from "../../domain/repositories/IEditorialRepository";

export class SupabaseEditorialRepository implements IEditorialRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async get(): Promise<Editorial | null> {
        try {
            const { data, error } = await this.supabase
                .from("editorial")
                .select("*")
                .eq("id", 1)
                .single();

            if (error || !data) return null;

            return {
                id: data.id,
                content: data.content ?? "",
                updatedAt: new Date(data.updated_at),
            };
        } catch {
            return null;
        }
    }

    async save(content: string): Promise<void> {
        const { error } = await this.supabase
            .from("editorial")
            .upsert({ id: 1, content, updated_at: new Date().toISOString() });

        if (error) throw error;
    }
}
