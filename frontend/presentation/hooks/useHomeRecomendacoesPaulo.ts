"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    RECOMENDACOES_PAULO_DEFAULT_DESCRIPTION,
    RECOMENDACOES_PAULO_DEFAULT_TITLE,
    getRecomendacoesPauloSourcePath,
} from "@/constants/recomendacoesPaulo";

interface RecomendacoesPauloRow {
    slug: string;
    title: string | null;
    description: string | null;
    html_path: string | null;
}

export interface HomeRecomendacoesPauloData {
    title: string;
    description: string;
    sourceHtmlPath: string | null;
    available: boolean;
}

export interface UseHomeRecomendacoesPauloResult {
    data: HomeRecomendacoesPauloData;
    isLoading: boolean;
}

const defaultData: HomeRecomendacoesPauloData = {
    title: RECOMENDACOES_PAULO_DEFAULT_TITLE,
    description: RECOMENDACOES_PAULO_DEFAULT_DESCRIPTION,
    sourceHtmlPath: null,
    available: false,
};

export function useHomeRecomendacoesPaulo(): UseHomeRecomendacoesPauloResult {
    const { data, isLoading } = useQuery({
        queryKey: ["home-recomendacoes-paulo"],
        queryFn: async () => {
            const res = await fetch("/api/content/home-recomendacoes-paulo");
            if (!res.ok) {
                console.error("Erro ao carregar recomendacoes do Paulo:", res.status);
                return { row: null, available: false };
            }
            return (await res.json()) as { row: RecomendacoesPauloRow | null; available: boolean };
        },
        staleTime: 5 * 60 * 1000,
    });

    const resolved = useMemo(() => {
        if (!data) {
            return defaultData;
        }

        const row = data.row;
        return {
            title: row?.title?.trim() || RECOMENDACOES_PAULO_DEFAULT_TITLE,
            description: row?.description?.trim() || RECOMENDACOES_PAULO_DEFAULT_DESCRIPTION,
            sourceHtmlPath: row?.html_path || getRecomendacoesPauloSourcePath(),
            available: data.available,
        } satisfies HomeRecomendacoesPauloData;
    }, [data]);

    return { data: resolved, isLoading };
}
