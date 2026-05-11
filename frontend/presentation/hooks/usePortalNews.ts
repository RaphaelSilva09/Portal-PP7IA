/**
 * usePortalNews Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados das novidades do portal.
 * Consome o endpoint HTTP `/api/content/portal-news`.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado das novidades
 * - React Query: Cache automático, retry e otimizações
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { PortalNewsItem } from "../../domain/entities/PortalNewsItem";
import type { PortalNewsItemProps } from "../../domain/entities/PortalNewsItem";

interface UsePortalNewsResult {
    items: PortalNewsItem[];
    isLoading: boolean;
    error: string | null;
}

function rehydrateItem(raw: unknown): PortalNewsItem {
    const props = (raw as { props?: PortalNewsItemProps })?.props ?? (raw as PortalNewsItemProps);
    return PortalNewsItem.create({
        ...props,
        publishedAt: props.publishedAt ? new Date(props.publishedAt) : new Date(0),
        createdAt: props.createdAt ? new Date(props.createdAt) : new Date(0),
        updatedAt: props.updatedAt ? new Date(props.updatedAt) : new Date(0),
    });
}

export function usePortalNews(): UsePortalNewsResult {
    const { data, isLoading, error } = useQuery({
        queryKey: ["portalNews"],
        queryFn: async () => {
            const res = await fetch("/api/content/portal-news");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as { items: unknown[] };
            return (json.items ?? []).map(rehydrateItem);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnMount: "always",
    });

    return {
        items: data ?? [],
        isLoading,
        error: error ? "Erro ao carregar novidades." : null,
    };
}
