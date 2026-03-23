/**
 * usePortalNews Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados das novidades do portal.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado das novidades
 * - React Query: Cache automático, retry e otimizações
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { PortalNewsItem } from "../../domain/entities/PortalNewsItem";
import DIContainer from "../../infrastructure/di/container";

interface UsePortalNewsResult {
    items: PortalNewsItem[];
    isLoading: boolean;
    error: string | null;
}

export function usePortalNews(): UsePortalNewsResult {
    const { data, isLoading, error } = useQuery({
        queryKey: ["portalNews"],
        queryFn: async () => {
            const useCase = DIContainer.getPortalNewsUseCase();
            return await useCase.execute();
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
