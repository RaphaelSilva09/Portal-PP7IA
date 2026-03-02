"use client";

/**
 * useHomePageDates (Presentation Layer)
 *
 * Busca em paralelo a data do item mais recente de cada seção de conteúdo.
 * Compara as datas em nível de dia para identificar quais seções foram
 * atualizadas mais recentemente e retorna flags `isNew` para cada uma.
 *
 * Princípios aplicados:
 * - SRP: responsável apenas por calcular flags de "novo" para a home
 * - Promise.allSettled: falhas individuais não bloqueiam as demais seções
 */

import { useEffect, useState } from "react";
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
function toDayTimestamp(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Formata uma Date como "dd.mm.yyyy". */
function formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}.${mm}.${d.getFullYear()}`;
}

export function useHomePageDates(): UseHomePageDatesResult {
    const [isNew, setIsNew] = useState<HomePageNewFlags>(DEFAULT_FLAGS);
    const [mostRecentDate, setMostRecentDate] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchDates() {
            setIsLoading(true);

            // Dispara todos os use cases em paralelo.
            // allSettled garante que uma falha isolada não cancela as demais.
            const results = await Promise.allSettled([
                DIContainer.getNewslettersUseCase().execute(),        // 0: { latest, older }
                DIContainer.getEspecialSemanaUseCase().getLatest(),   // 1: EspecialSemana | null
                DIContainer.getRadarOportunidadesUseCase().execute(), // 2: { latest, older }
                DIContainer.getMiniLivrosUseCase().execute(),         // 3: { latest, older }
                DIContainer.getBibliotecaUseCase().execute(),         // 4: { latest, older }
                DIContainer.getEstudarUseCase().execute(),            // 5: { latest, older }
            ]);

            if (cancelled) return;

            const [r0, r1, r2, r3, r4, r5] = results;

            // Extrai createdAt de cada resultado, normalizando o formato diferente do EspecialSemana.
            const rawDates: Array<Date | null> = [
                r0.status === "fulfilled" ? (r0.value.latest?.createdAt ?? null) : null,
                r1.status === "fulfilled" ? (r1.value?.createdAt ?? null) : null,
                r2.status === "fulfilled" ? (r2.value.latest?.createdAt ?? null) : null,
                r3.status === "fulfilled" ? (r3.value.latest?.createdAt ?? null) : null,
                r4.status === "fulfilled" ? (r4.value.latest?.createdAt ?? null) : null,
                r5.status === "fulfilled" ? (r5.value.latest?.createdAt ?? null) : null,
            ];

            // Converte para timestamps em nível de dia; datas inválidas viram null.
            const timestamps = rawDates.map((d) =>
                d instanceof Date && !isNaN(d.getTime()) ? toDayTimestamp(d) : null,
            );

            const valid = timestamps.filter((t): t is number => t !== null);

            if (valid.length === 0) {
                setIsNew(DEFAULT_FLAGS);
                setMostRecentDate("");
                setIsLoading(false);
                return;
            }

            const maxTs = Math.max(...valid);

            const flags: HomePageNewFlags = {
                newsletter: timestamps[0] === maxTs,
                especial:   timestamps[1] === maxTs,
                radar:      timestamps[2] === maxTs,
                miniLivros: timestamps[3] === maxTs,
                biblioteca: timestamps[4] === maxTs,
                estudar:    timestamps[5] === maxTs,
            };

            setIsNew(flags);
            setMostRecentDate(formatDate(new Date(maxTs)));
            setIsLoading(false);
        }

        fetchDates();
        return () => {
            cancelled = true;
        };
    }, []);

    return { isNew, mostRecentDate, isLoading };
}
