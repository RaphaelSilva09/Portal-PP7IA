/**
 * useMiniLivros Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados de mini-livros.
 * Fornece interface simples para componentes consumirem casos de uso.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado de mini-livros
 * - Clean Architecture: Camada de apresentação depende de casos de uso
 * - React Query: Cache automático, retry e cancelamento na desmontagem
 */

"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MiniLivro } from "../../domain/entities/MiniLivro";
import DIContainer from "../../infrastructure/di/container";

interface UseMiniLivrosResult {
    latest: MiniLivro | null;
    older: MiniLivro[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refresh: () => void;
}

export function useMiniLivros(): UseMiniLivrosResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["mini-livros"],
        queryFn: async () => {
            const useCase = DIContainer.getMiniLivrosUseCase();
            const repo = DIContainer.getContentRepository();
            const [result, lastUpdated] = await Promise.all([
                useCase.execute(),
                repo.getLastUpdated("mini-livro"),
            ]);
            return { ...result, lastUpdated };
        },
    });

    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["mini-livros"] });
    }, [queryClient]);

    return {
        latest: data?.latest ?? null,
        older: data?.older ?? [],
        isLoading,
        error: error ? "Erro ao carregar mini-livros. Tente novamente." : null,
        lastUpdated: data?.lastUpdated ?? null,
        refresh,
    };
}
