/**
 * useBiblioteca Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados da biblioteca.
 * Fornece interface simples para componentes consumirem casos de uso.
 * Suporta filtragem client-side por tema.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado da biblioteca
 * - Clean Architecture: Camada de apresentação depende de casos de uso
 * - React Query: Cache automático, retry e cancelamento na desmontagem
 */

"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BibliotecaItem, BIBLIOTECA_TEMAS } from "../../domain/entities/BibliotecaItem";
import type { BibliotecaTema } from "../../domain/entities/BibliotecaItem";
import DIContainer from "../../infrastructure/di/container";

interface UseBibliotecaResult {
    latest: BibliotecaItem | null;
    older: BibliotecaItem[];
    /** Item em destaque para o tema ativo (ou global quando "Todos") */
    activeLatest: BibliotecaItem | null;
    /** Demais itens do tema ativo, excluindo o destaque */
    filteredOlder: BibliotecaItem[];
    activeTema: BibliotecaTema | null;
    setActiveTema: (tema: BibliotecaTema | null) => void;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refresh: () => void;
}

export function useBiblioteca(): UseBibliotecaResult {
    const queryClient = useQueryClient();
    const [activeTema, setActiveTema] = useState<BibliotecaTema | null>(BIBLIOTECA_TEMAS[0].slug);

    const { data, isLoading, error } = useQuery({
        queryKey: ["biblioteca"],
        queryFn: async () => {
            const useCase = DIContainer.getBibliotecaUseCase();
            const repo = DIContainer.getContentRepository();
            const [result, lastUpdated] = await Promise.all([
                useCase.execute(),
                repo.getLastUpdated("biblioteca"),
            ]);
            return { ...result, lastUpdated };
        },
    });

    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["biblioteca"] });
    }, [queryClient]);

    const latest = data?.latest ?? null;
    const older = data?.older ?? [];
    const lastUpdated = data?.lastUpdated ?? null;

    // Filtragem client-side por tema (null = Todos)
    const allItems = latest ? [latest, ...older] : older;

    const activeLatest: BibliotecaItem | null = activeTema
        ? (allItems.find(item => item.tema === activeTema) ?? null)
        : latest;

    const filteredOlder: BibliotecaItem[] = activeTema
        ? allItems.filter(item => item.tema === activeTema && item !== activeLatest)
        : older;

    return {
        latest,
        older,
        activeLatest,
        filteredOlder,
        activeTema,
        setActiveTema,
        isLoading,
        error: error ? "Erro ao carregar biblioteca. Tente novamente." : null,
        lastUpdated,
        refresh,
    };
}
