/**
 * useAnnouncementBars Hook (Presentation Layer)
 *
 * Hook React para barras de aviso visíveis publicamente.
 * Consome o endpoint HTTP `/api/content/announcement-bars`.
 * Filtra client-side por isLive() após fetch.
 *
 * NOTE: Usa polling (refetchInterval) em vez de Realtime,
 * pois o repositório não possui canal de tempo real configurado.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes públicos
 * - React Query: Cache automático, retry, polling a cada 60s
 */

"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnnouncementBar } from "../../domain/entities/AnnouncementBar";
import type { AnnouncementBarProps } from "../../domain/entities/AnnouncementBar";

interface UseAnnouncementBarsResult {
    bars: AnnouncementBar[];
    isLoading: boolean;
}

function rehydrateItem(raw: unknown): AnnouncementBar {
    const props = (raw as { props?: AnnouncementBarProps })?.props ?? (raw as AnnouncementBarProps);
    return AnnouncementBar.create({
        ...props,
        startsAt: props.startsAt ? new Date(props.startsAt) : null,
        endsAt: props.endsAt ? new Date(props.endsAt) : null,
        createdAt: props.createdAt ? new Date(props.createdAt) : new Date(0),
        updatedAt: props.updatedAt ? new Date(props.updatedAt) : new Date(0),
    });
}

export function useAnnouncementBars(): UseAnnouncementBarsResult {
    const { data, isLoading } = useQuery({
        queryKey: ["announcement-bars"],
        queryFn: async () => {
            const res = await fetch("/api/content/announcement-bars");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as { items: unknown[] };
            return (json.items ?? []).map(rehydrateItem);
        },
        staleTime: 60_000,
        refetchInterval: 60_000,
    });

    const bars = useMemo(() => {
        if (!data) return [];
        const now = new Date();
        return data.filter(bar => bar.isLive(now));
    }, [data]);

    return { bars, isLoading };
}
