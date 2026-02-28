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

import { useCallback, useEffect, useRef, useState } from "react";
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
                console.warn("⚠️ useEbook: timeout após 10s");
                setError("Tempo limite excedido. Tente recarregar a página.");
                setIsLoading(false);
            }
        }, 10000);

        try {
            const useCase = DIContainer.getEbookUseCase();
            const result = await useCase.execute();
            if (mountedRef.current) {
                setLatest(result.latest);
                setAll(result.all);
            }
        } catch (err) {
            console.error("Erro ao carregar e-books:", err);
            if (mountedRef.current) {
                setError("Erro ao carregar e-books.");
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

    return { latest, all, isLoading, error, reload: fetchData };
}
