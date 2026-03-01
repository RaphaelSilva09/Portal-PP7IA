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

import { useCallback, useEffect, useRef, useState } from "react";
import { RadarOportunidades } from "../../domain/entities/RadarOportunidades";
import DIContainer from "../../infrastructure/di/container";

interface UseRadarOportunidadesResult {
    latest: RadarOportunidades | null;
    older: RadarOportunidades[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    reload: () => Promise<void>;
}

export function useRadarOportunidades(): UseRadarOportunidadesResult {
    const [latest, setLatest] = useState<RadarOportunidades | null>(null);
    const [older, setOlder] = useState<RadarOportunidades[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fetchData = useCallback(async () => {
        if (!mountedRef.current) return;
        setIsLoading(true);
        setError(null);

        const timeoutId = setTimeout(() => {
            if (mountedRef.current) {
                console.warn("⚠️ useRadarOportunidades: timeout após 10s");
                setError("Tempo limite excedido. Tente recarregar a página.");
                setIsLoading(false);
            }
        }, 10000);

        try {
            const useCase = DIContainer.getRadarOportunidadesUseCase();
            const repo = DIContainer.getContentRepository();
            const [result, lu] = await Promise.all([useCase.execute(), repo.getLastUpdated("radar_oportunidades")]);
            if (mountedRef.current) {
                setLatest(result.latest);
                setOlder(result.older);
                setLastUpdated(lu);
            }
        } catch (err) {
            console.error("Erro ao carregar radar de oportunidades:", err);
            if (mountedRef.current) {
                setError("Erro ao carregar radar de oportunidades.");
            }
        } finally {
            clearTimeout(timeoutId);
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { latest, older, isLoading, error, lastUpdated, reload: fetchData };
}
