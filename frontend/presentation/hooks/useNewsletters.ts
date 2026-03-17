/**
 * useNewsletters Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados de newsletters.
 * Fornece interface simples para componentes consumirem casos de uso.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado de newsletters
 * - Clean Architecture: Camada de apresentação depende de casos de uso
 * - React Query: Cache automático, retry e cancelamento na desmontagem
 */

"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Newsletter } from "../../domain/entities/Newsletter";
import DIContainer from "../../infrastructure/di/container";

interface UseNewslettersResult {
    latest: Newsletter | null;
    older: Newsletter[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refresh: () => void;
}

export function useNewsletters(): UseNewslettersResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["newsletters"],
        queryFn: async () => {
            const useCase = DIContainer.getNewslettersUseCase();
            const repo = DIContainer.getContentRepository();
            const [result, lastUpdated] = await Promise.all([
                useCase.execute(),
                repo.getLastUpdated("newsletter"),
            ]);
            return { ...result, lastUpdated };
        },
    });

    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["newsletters"] });
    }, [queryClient]);

    return {
        latest: data?.latest ?? null,
        older: data?.older ?? [],
        isLoading,
        error: error ? "Erro ao carregar newsletters. Tente novamente." : null,
        lastUpdated: data?.lastUpdated ?? null,
        refresh,
    };
}
