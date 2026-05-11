"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Estudar } from "../../domain/entities/Estudar";
import type { EstudarProps } from "../../domain/entities/Estudar";

interface UseEstudarResult {
    latest: Estudar | null;
    older: Estudar[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    reload: () => void;
}

function rehydrateItem(raw: unknown): Estudar {
    const props = (raw as { props?: EstudarProps })?.props ?? (raw as EstudarProps);
    return Estudar.create({
        ...props,
        createdAt: props.createdAt ? new Date(props.createdAt) : new Date(0),
    });
}

export function useEstudar(): UseEstudarResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["estudar"],
        queryFn: async () => {
            const res = await fetch("/api/content/estudar");
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

    const reload = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["estudar"] });
    }, [queryClient]);

    return {
        latest: data?.latest ?? null,
        older: data?.older ?? [],
        isLoading,
        error: error ? "Erro ao carregar conteúdo de estudo." : null,
        lastUpdated: data?.lastUpdated ?? null,
        reload,
    };
}
