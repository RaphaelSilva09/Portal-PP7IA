/**
 * SupabaseAnnouncementBarRepository (Infrastructure Layer)
 *
 * Implementação concreta de IAnnouncementBarRepository usando Supabase.
 * Leituras via supabaseAnon; escritas via supabase (sessão autenticada).
 *
 * Princípios aplicados:
 * - Adapter Pattern: Adapta Supabase para interface de domínio
 * - SRP: Responsável apenas pela comunicação com a tabela announcement_bars
 * - Graceful Degradation: getAll() retorna [] em caso de erro
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { AnnouncementBar, AnnouncementBarProps } from "../../domain/entities/AnnouncementBar";
import {
    CreateAnnouncementBarInput,
    IAnnouncementBarRepository,
    UpdateAnnouncementBarInput,
} from "../../domain/repositories/IAnnouncementBarRepository";

interface SupabaseAnnouncementBarRow {
    id: string;
    message: string;
    link_url: string | null;
    link_label: string | null;
    bg_color: string;
    text_color: string;
    is_active: boolean;
    priority: number;
    starts_at: string | null;
    ends_at: string | null;
    is_closable: boolean;
    created_at: string;
    updated_at: string;
}

export class SupabaseAnnouncementBarRepository implements IAnnouncementBarRepository {
    constructor(
        private readonly anonClient: SupabaseClient,
        private readonly authClient: SupabaseClient,
    ) {}

    async getAll(): Promise<AnnouncementBar[]> {
        try {
            const { data, error } = await this.anonClient
                .from("announcement_bars")
                .select("*")
                .order("priority", { ascending: false });

            if (error) {
                console.error("Erro ao buscar barras de aviso:", error.message);
                return [];
            }

            return (data ?? []).map(row => this.mapToEntity(row as SupabaseAnnouncementBarRow));
        } catch (err) {
            console.error("Erro inesperado ao buscar barras de aviso:", err);
            return [];
        }
    }

    async create(input: CreateAnnouncementBarInput): Promise<AnnouncementBar> {
        const { data, error } = await this.authClient
            .from("announcement_bars")
            .insert({
                message:    input.message,
                link_url:   input.linkUrl ?? null,
                link_label: input.linkLabel ?? null,
                bg_color:   input.bgColor ?? "#1a1a1a",
                text_color: input.textColor ?? "#ffffff",
                is_active:  input.isActive ?? true,
                priority:   input.priority ?? 0,
                starts_at:  input.startsAt?.toISOString() ?? null,
                ends_at:    input.endsAt?.toISOString() ?? null,
                is_closable: input.isClosable ?? true,
            })
            .select()
            .single();

        if (error || !data) throw new Error(`Falha ao criar barra de aviso: ${error?.message}`);
        return this.mapToEntity(data as SupabaseAnnouncementBarRow);
    }

    async update(id: string, input: UpdateAnnouncementBarInput): Promise<AnnouncementBar> {
        const updateData: Record<string, unknown> = {};
        if (input.message    !== undefined) updateData.message    = input.message;
        if (input.linkUrl    !== undefined) updateData.link_url   = input.linkUrl;
        if (input.linkLabel  !== undefined) updateData.link_label = input.linkLabel;
        if (input.bgColor    !== undefined) updateData.bg_color   = input.bgColor;
        if (input.textColor  !== undefined) updateData.text_color = input.textColor;
        if (input.isActive   !== undefined) updateData.is_active  = input.isActive;
        if (input.priority   !== undefined) updateData.priority   = input.priority;
        if (input.isClosable !== undefined) updateData.is_closable = input.isClosable;
        if (input.startsAt   !== undefined) updateData.starts_at  = input.startsAt?.toISOString() ?? null;
        if (input.endsAt     !== undefined) updateData.ends_at    = input.endsAt?.toISOString() ?? null;

        const { data, error } = await this.authClient
            .from("announcement_bars")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error || !data) throw new Error(`Falha ao atualizar barra de aviso: ${error?.message}`);
        return this.mapToEntity(data as SupabaseAnnouncementBarRow);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.authClient
            .from("announcement_bars")
            .delete()
            .eq("id", id);

        if (error) throw new Error(`Falha ao deletar barra de aviso: ${error.message}`);
    }

    async toggle(id: string, isActive: boolean): Promise<void> {
        const { error } = await this.authClient
            .from("announcement_bars")
            .update({ is_active: isActive })
            .eq("id", id);

        if (error) throw new Error(`Falha ao alternar barra de aviso: ${error.message}`);
    }

    private mapToEntity(row: SupabaseAnnouncementBarRow): AnnouncementBar {
        const props: AnnouncementBarProps = {
            id:         row.id,
            message:    row.message,
            linkUrl:    row.link_url,
            linkLabel:  row.link_label,
            bgColor:    row.bg_color,
            textColor:  row.text_color,
            isActive:   row.is_active,
            priority:   row.priority,
            startsAt:   row.starts_at ? new Date(row.starts_at) : null,
            endsAt:     row.ends_at   ? new Date(row.ends_at)   : null,
            isClosable: row.is_closable,
            createdAt:  new Date(row.created_at),
            updatedAt:  new Date(row.updated_at),
        };
        return AnnouncementBar.create(props);
    }
}
