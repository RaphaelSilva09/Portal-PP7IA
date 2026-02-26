/**
 * useRadarOportunidades Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados do Radar de Oportunidades.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado do radar de oportunidades
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { RadarOportunidades } from "../../domain/entities/RadarOportunidades";
import DIContainer from "../../infrastructure/di/container";

interface UseRadarOportunidadesResult {
    latest: RadarOportunidades | null;
    older: RadarOportunidades[];
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

export function useRadarOportunidades(): UseRadarOportunidadesResult {
    const [latest, setLatest] = useState<RadarOportunidades | null>(null);
    const [older, setOlder] = useState<RadarOportunidades[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const useCase = DIContainer.getRadarOportunidadesUseCase();
            const result = await useCase.execute();
            setLatest(result.latest);
            setOlder(result.older);
        } catch (err) {
            console.error("Erro ao carregar radar de oportunidades:", err);
            setError("Erro ao carregar radar de oportunidades.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { latest, older, isLoading, error, reload: fetchData };
}
