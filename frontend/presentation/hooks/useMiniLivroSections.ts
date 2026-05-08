"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { MiniLivroSection } from "@/domain/entities/MiniLivroSection";
import DIContainer from "@/infrastructure/di/container";

interface UseMiniLivroSectionsResult {
    introducoes: MiniLivroSection[];
    encerramentos: MiniLivroSection[];
    all: MiniLivroSection[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useMiniLivroSections(): UseMiniLivroSectionsResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["mini-livro-sections"],
        queryFn: async () => DIContainer.getMiniLivroSectionsUseCase().execute(),
    });

    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["mini-livro-sections"] });
    }, [queryClient]);

    return {
        introducoes: data?.introducoes ?? [],
        encerramentos: data?.encerramentos ?? [],
        all: data?.all ?? [],
        isLoading,
        error: error ? "Erro ao carregar seções extras dos mini-livros." : null,
        refresh,
    };
}
