/**
 * useNewsletters Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados de newsletters.
 * Consome o endpoint HTTP `/api/content/newsletter`.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado de newsletters
 * - Clean Architecture: Camada de apresentação consome HTTP API
 * - React Query: Cache automático, retry e cancelamento na desmontagem
 */

"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Newsletter } from "../../domain/entities/Newsletter";
import type { NewsletterProps } from "../../domain/entities/Newsletter";

interface UseNewslettersResult {
    latest: Newsletter | null;
    older: Newsletter[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refresh: () => void;
}

function rehydrateItem(raw: unknown): Newsletter {
    const props = (raw as { props?: NewsletterProps })?.props ?? (raw as NewsletterProps);
    return Newsletter.create({
        ...props,
        createdAt: props.createdAt ? new Date(props.createdAt) : new Date(0),
        updatedAt: props.updatedAt ? new Date(props.updatedAt) : null,
    });
}

export function useNewsletters(): UseNewslettersResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["newsletters"],
        queryFn: async () => {
            const res = await fetch("/api/content/newsletter");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as {
                latest: unknown;
                older: unknown[];
                lastUpdated: string | null;
            };
            return {
                latest: json.latest ? rehydrateItem(json.latest) : null,
                older: (json.older ?? []).map(rehydrateItem),
                lastUpdated: json.lastUpdated ? new Date(json.lastUpdated) : null,
            };
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
