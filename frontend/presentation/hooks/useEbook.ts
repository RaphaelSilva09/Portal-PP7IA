/**
 * useEbook Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados de E-books.
 * Consome o endpoint HTTP `/api/content/ebook`.
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
import type { EbookProps } from "../../domain/entities/Ebook";

interface UseEbookResult {
    latest: Ebook | null;
    all: Ebook[];
    isLoading: boolean;
    error: string | null;
    reload: () => void;
}

function rehydrateItem(raw: unknown): Ebook {
    const props = (raw as { props?: EbookProps })?.props ?? (raw as EbookProps);
    return Ebook.create({
        ...props,
        createdAt: props.createdAt ? new Date(props.createdAt) : new Date(0),
    });
}

export function useEbook(): UseEbookResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["ebook"],
        queryFn: async () => {
            const res = await fetch("/api/content/ebook");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as { latest: unknown; all: unknown[] };
            return {
                latest: json.latest ? rehydrateItem(json.latest) : null,
                all: (json.all ?? []).map(rehydrateItem),
            };
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
