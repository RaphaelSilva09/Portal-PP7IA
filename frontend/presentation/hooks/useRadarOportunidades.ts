/**
 * useRadarOportunidades Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados do Radar de Oportunidades.
 * Consome o endpoint HTTP `/api/content/radar_oportunidades`.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado do radar de oportunidades
 * - React Query: Cache automático, retry e cancelamento na desmontagem
 */

"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RadarOportunidades } from "../../domain/entities/RadarOportunidades";
import type { RadarOportunidadesProps } from "../../domain/entities/RadarOportunidades";

interface UseRadarOportunidadesResult {
    latest: RadarOportunidades | null;
    older: RadarOportunidades[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    reload: () => void;
}

function rehydrateItem(raw: unknown): RadarOportunidades {
    const props = (raw as { props?: RadarOportunidadesProps })?.props ?? (raw as RadarOportunidadesProps);
    return RadarOportunidades.create({
        ...props,
        createdAt: props.createdAt ? new Date(props.createdAt) : new Date(0),
        updatedAt: props.updatedAt ? new Date(props.updatedAt) : null,
    });
}

export function useRadarOportunidades(): UseRadarOportunidadesResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["radar-oportunidades"],
        queryFn: async () => {
            const res = await fetch("/api/content/radar_oportunidades");
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
        queryClient.invalidateQueries({ queryKey: ["radar-oportunidades"] });
    }, [queryClient]);

    return {
        latest: data?.latest ?? null,
        older: data?.older ?? [],
        isLoading,
        error: error ? "Erro ao carregar radar de oportunidades." : null,
        lastUpdated: data?.lastUpdated ?? null,
        reload,
    };
}
