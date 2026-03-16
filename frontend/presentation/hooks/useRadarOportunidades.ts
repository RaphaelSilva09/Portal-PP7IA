/**
 * useRadarOportunidades Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados do Radar de Oportunidades.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado do radar de oportunidades
 * - React Query: Cache automático, retry e cancelamento na desmontagem
 */

"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RadarOportunidades } from "../../domain/entities/RadarOportunidades";
import DIContainer from "../../infrastructure/di/container";

interface UseRadarOportunidadesResult {
    latest: RadarOportunidades | null;
    older: RadarOportunidades[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    reload: () => void;
}

export function useRadarOportunidades(): UseRadarOportunidadesResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["radar-oportunidades"],
        queryFn: async () => {
            const useCase = DIContainer.getRadarOportunidadesUseCase();
            const repo = DIContainer.getContentRepository();
            const [result, lastUpdated] = await Promise.all([
                useCase.execute(),
                repo.getLastUpdated("radar_oportunidades"),
            ]);
            return { ...result, lastUpdated };
        },
    });

    const reload = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["radar-oportunidades"] });
    }, [queryClient]);

    return {
        latest: data?.latest ?? null,
        older: data?.older ?? [],
        isLoading,
        error: error ? "Erro ao carregar radar de oportunidades." : null,
        lastUpdated: data?.lastUpdated ?? null,
        reload,
    };
}
