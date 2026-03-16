"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Estudar } from "../../domain/entities/Estudar";
import DIContainer from "../../infrastructure/di/container";

interface UseEstudarResult {
    latest: Estudar | null;
    older: Estudar[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    reload: () => void;
}

export function useEstudar(): UseEstudarResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["estudar"],
        queryFn: async () => {
            const useCase = DIContainer.getEstudarUseCase();
            const repo = DIContainer.getContentRepository();
            const [result, lastUpdated] = await Promise.all([
                useCase.execute(),
                repo.getLastUpdated("estudar"),
            ]);
            return { ...result, lastUpdated };
        },
    });

    const reload = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["estudar"] });
    }, [queryClient]);

    return {
        latest: data?.latest ?? null,
        older: data?.older ?? [],
        isLoading,
        error: error ? "Erro ao carregar conteúdo de estudo." : null,
        lastUpdated: data?.lastUpdated ?? null,
        reload,
    };
}
