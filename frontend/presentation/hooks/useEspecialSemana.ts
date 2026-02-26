/**
 * useEspecialSemana Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados do Especial da Semana.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado do especial da semana
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { EspecialSemana } from "../../domain/entities/EspecialSemana";
import DIContainer from "../../infrastructure/di/container";

interface UseEspecialSemanaResult {
    latest: EspecialSemana | null;
    older: EspecialSemana[];
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

export function useEspecialSemana(): UseEspecialSemanaResult {
    const [latest, setLatest] = useState<EspecialSemana | null>(null);
    const [older, setOlder] = useState<EspecialSemana[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const useCase = DIContainer.getEspecialSemanaUseCase();
            const all = await useCase.execute();
            const [first, ...rest] = all;
            setLatest(first ?? null);
            setOlder(rest);
        } catch (err) {
            console.error("Erro ao carregar especial da semana:", err);
            setError("Erro ao carregar especial da semana.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { latest, older, isLoading, error, reload: fetchData };
}
