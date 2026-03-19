/**
 * useEditorial Hook (Presentation Layer)
 *
 * Hook React para buscar o conteúdo editorial da página principal.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import DIContainer from "../../infrastructure/di/container";

interface UseEditorialResult {
    content: string;
    isLoading: boolean;
    error: string | null;
}

export function useEditorial(): UseEditorialResult {
    const { data, isLoading, error } = useQuery({
        queryKey: ["editorial"],
        queryFn: async () => {
            const useCase = DIContainer.getEditorialUseCase();
            return await useCase.execute();
        },
        staleTime: 5 * 60 * 1000,
    });

    return {
        content: data?.content ?? "",
        isLoading,
        error: error ? "Erro ao carregar editorial." : null,
    };
}
