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

import { useCallback, useEffect, useRef, useState } from "react";
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
                console.warn("⚠️ useEspecialSemana: timeout após 10s");
                setError("Tempo limite excedido. Tente recarregar a página.");
                setIsLoading(false);
            }
        }, 10000);

        try {
            const useCase = DIContainer.getEspecialSemanaUseCase();
            const all = await useCase.execute();
            if (mountedRef.current) {
                const [first, ...rest] = all;
                setLatest(first ?? null);
                setOlder(rest);
            }
        } catch (err) {
            console.error("Erro ao carregar especial da semana:", err);
            if (mountedRef.current) {
                setError("Erro ao carregar especial da semana.");
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

    return { latest, older, isLoading, error, reload: fetchData };
}
