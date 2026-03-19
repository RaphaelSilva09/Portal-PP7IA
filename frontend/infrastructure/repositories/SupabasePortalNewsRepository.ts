/**
 * SupabasePortalNewsRepository (Infrastructure Layer)
 *
 * Implementação concreta do IPortalNewsRepository usando Supabase.
 * Inclui tratamento de erros resiliente - nunca quebra a aplicação.
 *
 * Princípios aplicados:
 * - DIP: Implementa a interface definida no domínio
 * - Adapter Pattern: Adapta a API do Supabase para nosso domínio
 * - SRP: Responsável apenas pela comunicação com Supabase
 * - Graceful Degradation: Retorna dados vazios em caso de erro
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
    PortalNewsCategory,
    PortalNewsItem,
    PortalNewsItemProps,
} from "../../domain/entities/PortalNewsItem";
import { IPortalNewsRepository } from "../../domain/repositories/IPortalNewsRepository";

/**
 * Interface que representa a estrutura da tabela no Supabase
 */
interface SupabasePortalNewsRow {
    id: string;
    title: string;
    description: string | null;
    icon: string;
    category: string;
    accent_color: string | null;
    published_at: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    link_type: string | null;
    link_item_id: number | null;
}

/**
 * Adapter Pattern: Adapta Supabase para nossa interface de domínio
 */
export class SupabasePortalNewsRepository implements IPortalNewsRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    /**
     * Obtém todos os itens ativos ordenados por display_order ASC
     * Retorna array vazio em caso de erro (graceful degradation)
     */
    async getActive(): Promise<PortalNewsItem[]> {
        try {
            const { data, error } = await this.supabase
                .from("portal_news")
                .select("*")
                .eq("is_active", true)
                .order("display_order", { ascending: true });

            if (error) {
                console.error("Erro ao buscar novidades do portal:", error.message);
                return [];
            }

            if (!data || data.length === 0) {
                return [];
            }

            return data
                .filter((row): row is SupabasePortalNewsRow => this.isValidRow(row))
                .map(row => this.mapToEntity(row));
        } catch (err) {
            console.error("Erro inesperado ao buscar novidades do portal:", err);
            return [];
        }
    }

    /**
     * Valida se a row tem os campos mínimos necessários
     */
    private isValidRow(row: unknown): row is SupabasePortalNewsRow {
        if (!row || typeof row !== "object") return false;
        const r = row as Record<string, unknown>;
        return (
            typeof r.id === "string" &&
            typeof r.title === "string" &&
            typeof r.icon === "string" &&
            typeof r.category === "string"
        );
    }

    /**
     * Mapeia dados do Supabase para entidade de domínio
     * Adapter Pattern: Traduz formato externo para domínio
     */
    private mapToEntity(row: SupabasePortalNewsRow): PortalNewsItem {
        const props: PortalNewsItemProps = {
            id:           row.id,
            title:        row.title,
            description:  row.description,
            icon:         row.icon,
            category:     row.category as PortalNewsCategory,
            accentColor:  row.accent_color,
            publishedAt:  new Date(row.published_at),
            displayOrder: row.display_order,
            isActive:     row.is_active,
            createdAt:    new Date(row.created_at),
            updatedAt:    new Date(row.updated_at),
            linkType:     row.link_type,
            linkItemId:   row.link_item_id,
        };
        return PortalNewsItem.create(props);
    }
}
