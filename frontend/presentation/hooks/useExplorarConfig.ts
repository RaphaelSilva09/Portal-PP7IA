"use client";

import { useQuery } from "@tanstack/react-query";
import {
    DEFAULT_EXPLORAR_CONFIG,
    type ExplorarConfig,
    type ExplorarBlockId,
} from "@/domain/entities/ExplorarConfig";

export function useExplorarConfig(): ExplorarConfig {
    const { data } = useQuery<ExplorarConfig>({
        queryKey: ["explorar-config"],
        queryFn: async () => {
            const res = await fetch("/api/explorar-config");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json() as Promise<ExplorarConfig>;
        },
        staleTime: 60_000,
    });
    return data ?? DEFAULT_EXPLORAR_CONFIG;
}

export function useExplorarBlockConfig(id: ExplorarBlockId) {
    const config = useExplorarConfig();
    return config.blocks.find(b => b.id === id) ?? DEFAULT_EXPLORAR_CONFIG.blocks.find(b => b.id === id)!;
}
