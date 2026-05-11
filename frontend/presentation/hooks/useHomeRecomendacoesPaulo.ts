"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, supabaseAnon } from "@/infrastructure/config/supabase";
import {
    RECOMENDACOES_PAULO_DEFAULT_DESCRIPTION,
    RECOMENDACOES_PAULO_DEFAULT_TITLE,
    RECOMENDACOES_PAULO_SLUG,
    RECOMENDACOES_PAULO_STORAGE_BUCKET,
    RECOMENDACOES_PAULO_STORAGE_FOLDER,
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
            const [rowResult, storageResult] = await Promise.all([
                supabaseAnon
                    .from("home_recomendacoes_paulo")
                    .select("slug, title, description, html_path")
                    .eq("slug", RECOMENDACOES_PAULO_SLUG)
                    .maybeSingle(),
                supabase.storage
                    .from(RECOMENDACOES_PAULO_STORAGE_BUCKET)
                    .list(RECOMENDACOES_PAULO_STORAGE_FOLDER, { limit: 50 }),
            ]);

            if (rowResult.error) {
                console.error("Erro ao carregar recomendacoes do Paulo:", rowResult.error.message);
            }

            if (storageResult.error) {
                console.error("Erro ao listar HTMLs de recomendacoes:", storageResult.error.message);
            }

            const fileSet = new Set((storageResult.data ?? []).map(item => item.name));
            const available = fileSet.has(`${RECOMENDACOES_PAULO_SLUG}.html`);

            return {
                row: rowResult.data as RecomendacoesPauloRow | null,
                available,
            };
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
