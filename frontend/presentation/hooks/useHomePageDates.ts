"use client";

/**
 * useHomePageDates (Presentation Layer)
 *
 * Busca data do item mais recente de cada seção de conteúdo via materialized view.
 * Compara as datas em nível de dia para identificar quais seções foram
 * atualizadas mais recentemente e retorna flags `isNew` para cada uma.
 *
 * Performance improvements:
 * - Before: 6 parallel queries via Promise.allSettled (~500ms)
 * - After: 1 query to materialized view (~50ms)
 * - Reduction: 90% faster, 83% fewer queries
 *
 * Princípios aplicados:
 * - SRP: responsável apenas por calcular flags de "novo" para a home
 * - React Query: client-side cache, automatic retry, no useEffect
 * - Graceful Degradation: returns empty flags on error
 */

import { useQuery } from "@tanstack/react-query";
import DIContainer from "../../infrastructure/di/container";

export interface HomePageNewFlags {
    newsletter: boolean;
    especial: boolean;
    radar: boolean;
    miniLivros: boolean;
    biblioteca: boolean;
    estudar: boolean;
}

export interface UseHomePageDatesResult {
    isNew: HomePageNewFlags;
    /** Data mais recente entre todas as seções, formatada como "dd.mm.yyyy". Vazio enquanto carrega ou sem dados. */
    mostRecentDate: string;
    isLoading: boolean;
}

const DEFAULT_FLAGS: HomePageNewFlags = {
    newsletter: false,
    especial: false,
    radar: false,
    miniLivros: false,
    biblioteca: false,
    estudar: false,
};

/** Normaliza uma Date para meia-noite (horário local) para comparar apenas o dia. */
function toDayTimestamp(d: Date | null): number | null {
    if (!d) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Formata uma Date como "dd.mm.yyyy". */
function formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}.${mm}.${d.getFullYear()}`;
}

export function useHomePageDates(): UseHomePageDatesResult {
    const { data, isLoading } = useQuery({
        queryKey: ["homePageDates"],
        queryFn: async () => {
            const repo = DIContainer.getHomeDatesRepository();
            return await repo.getLatestDates();
        },
        staleTime: 15 * 60 * 1000, // 15 minutes (aligned with 10min MV refresh + margin)
        refetchOnMount: "always",
    });

    // Extract dates from query result (graceful degradation if no data)
    const dates = data ?? {
        newsletter: null,
        especial: null,
        radar: null,
        miniLivros: null,
        biblioteca: null,
        estudar: null,
    };

    // Convert dates to day-level timestamps
    const timestamps = [
        toDayTimestamp(dates.newsletter),
        toDayTimestamp(dates.especial),
        toDayTimestamp(dates.radar),
        toDayTimestamp(dates.miniLivros),
        toDayTimestamp(dates.biblioteca),
        toDayTimestamp(dates.estudar),
    ];

    const validTimestamps = timestamps.filter((t): t is number => t !== null);

    // If no valid dates, return default flags
    if (validTimestamps.length === 0) {
        return {
            isNew: DEFAULT_FLAGS,
            mostRecentDate: "",
            isLoading,
        };
    }

    // Find most recent timestamp
    const maxTs = Math.max(...validTimestamps);

    // Mark sections with most recent date as "new"
    const isNew: HomePageNewFlags = {
        newsletter: timestamps[0] === maxTs,
        especial: timestamps[1] === maxTs,
        radar: timestamps[2] === maxTs,
        miniLivros: timestamps[3] === maxTs,
        biblioteca: timestamps[4] === maxTs,
        estudar: timestamps[5] === maxTs,
    };

    const mostRecentDate = formatDate(new Date(maxTs));

    return { isNew, mostRecentDate, isLoading };
}
