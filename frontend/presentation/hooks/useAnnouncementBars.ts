/**
 * useAnnouncementBars Hook (Presentation Layer)
 *
 * Hook React para barras de aviso visíveis publicamente.
 * Filtra client-side por isLive() após fetch.
 *
 * NOTE: Usa polling (refetchInterval) em vez de Supabase Realtime,
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
import DIContainer from "../../infrastructure/di/container";

interface UseAnnouncementBarsResult {
    bars: AnnouncementBar[];
    isLoading: boolean;
}

export function useAnnouncementBars(): UseAnnouncementBarsResult {
    const { data, isLoading } = useQuery({
        queryKey: ["announcement-bars"],
        queryFn: async () => {
            const useCase = DIContainer.getAnnouncementBarsUseCase();
            return useCase.execute();
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
