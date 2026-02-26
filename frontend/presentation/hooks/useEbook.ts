/**
 * useEbook Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados de E-books.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado dos e-books
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { Ebook } from "../../domain/entities/Ebook";
import DIContainer from "../../infrastructure/di/container";

interface UseEbookResult {
    latest: Ebook | null;
    all: Ebook[];
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

export function useEbook(): UseEbookResult {
    const [latest, setLatest] = useState<Ebook | null>(null);
    const [all, setAll] = useState<Ebook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const useCase = DIContainer.getEbookUseCase();
            const result = await useCase.execute();
            setLatest(result.latest);
            setAll(result.all);
        } catch (err) {
            console.error("Erro ao carregar e-books:", err);
            setError("Erro ao carregar e-books.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { latest, all, isLoading, error, reload: fetchData };
}
