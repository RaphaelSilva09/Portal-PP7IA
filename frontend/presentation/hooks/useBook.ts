/**
 * useBook Hook (Presentation Layer)
 *
 * Hook React para carregar o Livro Principal (singleton ativo na tabela book).
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { Book } from "../../domain/entities/Book";
import DIContainer from "../../infrastructure/di/container";

interface UseBookResult {
    book: Book | null;
    isLoading: boolean;
    error: string | null;
}

export function useBook(): UseBookResult {
    const { data, isLoading, error } = useQuery({
        queryKey: ["active-book"],
        queryFn: async () => {
            const useCase = DIContainer.getActiveBookUseCase();
            return useCase.execute();
        },
    });

    return {
        book: data ?? null,
        isLoading,
        error: error ? "Erro ao carregar o livro em destaque." : null,
    };
}
