/**
 * useEstudar Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados do conteúdo Estudar.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado do estudar
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { Estudar } from "../../domain/entities/Estudar";
import DIContainer from "../../infrastructure/di/container";

interface UseEstudarResult {
    latest: Estudar | null;
    older: Estudar[];
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

export function useEstudar(): UseEstudarResult {
    const [latest, setLatest] = useState<Estudar | null>(null);
    const [older, setOlder] = useState<Estudar[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const useCase = DIContainer.getEstudarUseCase();
            const result = await useCase.execute();
            setLatest(result.latest);
            setOlder(result.older);
        } catch (err) {
            console.error("Erro ao carregar estudar:", err);
            setError("Erro ao carregar conteúdo de estudo.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { latest, older, isLoading, error, reload: fetchData };
}
