/**
 * useEspecialSemana Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados do Especial da Semana.
 * Consome o endpoint HTTP `/api/content/especial-semana`.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado do especial da semana
 * - React Query: Cache automático, retry e cancelamento na desmontagem
 */

"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EspecialSemana } from "../../domain/entities/EspecialSemana";
import type { EspecialSemanaProps } from "../../domain/entities/EspecialSemana";

interface UseEspecialSemanaResult {
    latest: EspecialSemana | null;
    older: EspecialSemana[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    reload: () => void;
}

function rehydrateItem(raw: unknown): EspecialSemana {
    const props = (raw as { props?: EspecialSemanaProps })?.props ?? (raw as EspecialSemanaProps);
    return EspecialSemana.create({
        ...props,
        createdAt: props.createdAt ? new Date(props.createdAt) : new Date(0),
    });
}

/**
 * O endpoint `/api/content/especial-semana` espalha o array do use case
 * dentro de um objeto (`{ ...array, lastUpdated }`). Em JS isso vira
 * `{ "0": item0, "1": item1, ..., lastUpdated }`. Reconstruímos a lista
 * a partir das chaves numéricas. Tolera também o shape `{ items, lastUpdated }`
 * caso o backend mude.
 */
function reconstructList(json: Record<string, unknown>): unknown[] {
    if (Array.isArray((json as { items?: unknown }).items)) {
        return (json as { items: unknown[] }).items;
    }
    const items: unknown[] = [];
    let i = 0;
    while (Object.prototype.hasOwnProperty.call(json, String(i))) {
        items.push(json[String(i)]);
        i++;
    }
    return items;
}

export function useEspecialSemana(): UseEspecialSemanaResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["especial-semana"],
        queryFn: async () => {
            const res = await fetch("/api/content/especial-semana");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as Record<string, unknown>;
            const all = reconstructList(json).map(rehydrateItem);
            const lastUpdatedRaw = json.lastUpdated as string | null | undefined;
            const [first, ...rest] = all;
            return {
                latest: first ?? null,
                older: rest,
                lastUpdated: lastUpdatedRaw ? new Date(lastUpdatedRaw) : null,
            };
        },
    });

    const reload = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["especial-semana"] });
    }, [queryClient]);

    return {
        latest: data?.latest ?? null,
        older: data?.older ?? [],
        isLoading,
        error: error ? "Erro ao carregar especial da semana." : null,
        lastUpdated: data?.lastUpdated ?? null,
        reload,
    };
}
