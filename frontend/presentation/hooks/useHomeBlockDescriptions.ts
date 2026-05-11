"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
            const res = await fetch("/api/content/home-block-descriptions");
            if (!res.ok) {
                console.error("Erro ao carregar descricoes da home:", res.status);
                return null;
            }
            return (await res.json()) as HomeBlockRow[];
        },
        staleTime: 5 * 60 * 1000,
    });

    const descriptions = useMemo(() => buildDescriptionsMap(data ?? null), [data]);

    return { descriptions, isLoading };
}
