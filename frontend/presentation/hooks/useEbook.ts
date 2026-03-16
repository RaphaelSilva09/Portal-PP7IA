/**
 * useEbook Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados de E-books.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado dos e-books
 * - React Query: Cache automático, retry e cancelamento na desmontagem
 */

"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ebook } from "../../domain/entities/Ebook";
import DIContainer from "../../infrastructure/di/container";

interface UseEbookResult {
    latest: Ebook | null;
    all: Ebook[];
    isLoading: boolean;
    error: string | null;
    reload: () => void;
}

export function useEbook(): UseEbookResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["ebook"],
        queryFn: async () => {
            const useCase = DIContainer.getEbookUseCase();
            return useCase.execute();
        },
    });

    const reload = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["ebook"] });
    }, [queryClient]);

    return {
        latest: data?.latest ?? null,
        all: data?.all ?? [],
        isLoading,
        error: error ? "Erro ao carregar e-books." : null,
        reload,
    };
}
