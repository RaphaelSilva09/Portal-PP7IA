/**
 * useMiniLivros Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados de mini-livros.
 * Consome o endpoint HTTP `/api/content/mini-livro`.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado de mini-livros
 * - Clean Architecture: Camada de apresentação consome HTTP API
 * - React Query: Cache automático, retry e cancelamento na desmontagem
 */

"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MiniLivro } from "../../domain/entities/MiniLivro";
import type { MiniLivroProps } from "../../domain/entities/MiniLivro";

interface UseMiniLivrosResult {
    latest: MiniLivro | null;
    older: MiniLivro[];
    all: MiniLivro[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refresh: () => void;
}

function rehydrateItem(raw: unknown): MiniLivro {
    const props = (raw as { props?: MiniLivroProps })?.props ?? (raw as MiniLivroProps);
    return MiniLivro.create({
        ...props,
        createdAt: props.createdAt ? new Date(props.createdAt) : new Date(0),
        updatedAt: props.updatedAt ? new Date(props.updatedAt) : null,
    });
}

export function useMiniLivros(): UseMiniLivrosResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["mini-livros"],
        queryFn: async () => {
            const res = await fetch("/api/content/mini-livro");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as {
                latest: unknown;
                older: unknown[];
                all: unknown[];
                lastUpdated: string | null;
            };
            return {
                latest: json.latest ? rehydrateItem(json.latest) : null,
                older: (json.older ?? []).map(rehydrateItem),
                all: (json.all ?? []).map(rehydrateItem),
                lastUpdated: json.lastUpdated ? new Date(json.lastUpdated) : null,
            };
        },
    });

    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["mini-livros"] });
    }, [queryClient]);

    return {
        latest: data?.latest ?? null,
        older: data?.older ?? [],
        all: data?.all ?? [],
        isLoading,
        error: error ? "Erro ao carregar mini-livros. Tente novamente." : null,
        lastUpdated: data?.lastUpdated ?? null,
        refresh,
    };
}
