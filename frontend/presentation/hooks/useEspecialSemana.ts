/**
 * useEspecialSemana Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados do Especial da Semana.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado do especial da semana
 * - React Query: Cache automático, retry e cancelamento na desmontagem
 */

"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EspecialSemana } from "../../domain/entities/EspecialSemana";
import DIContainer from "../../infrastructure/di/container";

interface UseEspecialSemanaResult {
    latest: EspecialSemana | null;
    older: EspecialSemana[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    reload: () => void;
}

export function useEspecialSemana(): UseEspecialSemanaResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["especial-semana"],
        queryFn: async () => {
            const useCase = DIContainer.getEspecialSemanaUseCase();
            const repo = DIContainer.getContentRepository();
            const [all, lastUpdated] = await Promise.all([
                useCase.execute(),
                repo.getLastUpdated("especial-semana"),
            ]);
            const [first, ...rest] = all;
            return { latest: first ?? null, older: rest, lastUpdated };
        },
    });

    const reload = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["especial-semana"] });
    }, [queryClient]);

    return {
        latest: data?.latest ?? null,
        older: data?.older ?? [],
        isLoading,
        error: error ? "Erro ao carregar especial da semana." : null,
        lastUpdated: data?.lastUpdated ?? null,
        reload,
    };
}
