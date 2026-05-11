"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseAnon } from "@/infrastructure/config/supabase";
import { HOME_BLOCK_DEFAULTS, type HomeBlockSlug } from "@/constants/homeBlocks";

interface HomeBlockRow {
    slug: HomeBlockSlug;
    description: string | null;
}

export interface UseHomeBlockDescriptionsResult {
    descriptions: Record<HomeBlockSlug, string>;
    isLoading: boolean;
}

function buildDescriptionsMap(rows: HomeBlockRow[] | null): Record<HomeBlockSlug, string> {
    const map = { ...HOME_BLOCK_DEFAULTS } as Record<HomeBlockSlug, string>;

    (rows ?? []).forEach(row => {
        if (row?.slug) {
            map[row.slug] = row.description?.trim() || HOME_BLOCK_DEFAULTS[row.slug];
        }
    });

    return map;
}

export function useHomeBlockDescriptions(): UseHomeBlockDescriptionsResult {
    const { data, isLoading } = useQuery({
        queryKey: ["home-block-descriptions"],
        queryFn: async () => {
            const { data, error } = await supabaseAnon
                .from("home_block_descriptions")
                .select("slug, description");

            if (error) {
                console.error("Erro ao carregar descricoes da home:", error.message);
                return null;
            }

            return data as HomeBlockRow[];
        },
        staleTime: 5 * 60 * 1000,
    });

    const descriptions = useMemo(() => buildDescriptionsMap(data ?? null), [data]);

    return { descriptions, isLoading };
}
