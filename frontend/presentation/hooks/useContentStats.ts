"use client";

import { useQuery } from "@tanstack/react-query";
import type { PublicContentStats } from "@/app/api/content/stats/route";

interface UseContentStatsResult {
    total: number;
    miniLivros: number;
    isLoading: boolean;
}

export function useContentStats(): UseContentStatsResult {
    const { data, isLoading } = useQuery({
        queryKey: ["content-stats"],
        queryFn: async () => {
            const res = await fetch("/api/content/stats");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return (await res.json()) as PublicContentStats;
        },
        staleTime: 5 * 60 * 1000,
    });

    return {
        total: data?.total ?? 0,
        miniLivros: data?.miniLivros ?? 0,
        isLoading,
    };
}
