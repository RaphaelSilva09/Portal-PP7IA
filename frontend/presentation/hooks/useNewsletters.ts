/**
 * useNewsletters Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados de newsletters.
 * Fornece interface simples para componentes consumirem casos de uso.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado de newsletters
 * - Clean Architecture: Camada de apresentação depende de casos de uso
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Newsletter } from "../../domain/entities/Newsletter";
import DIContainer from "../../infrastructure/di/container";

interface UseNewslettersResult {
    latest: Newsletter | null;
    older: Newsletter[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useNewsletters(): UseNewslettersResult {
    const [latest, setLatest] = useState<Newsletter | null>(null);
    const [older, setOlder] = useState<Newsletter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fetchNewsletters = useCallback(async () => {
        if (!mountedRef.current) return;
        setIsLoading(true);
        setError(null);

        const timeoutId = setTimeout(() => {
            if (mountedRef.current) {
                console.warn("⚠️ useNewsletters: timeout após 10s");
                setError("Tempo limite excedido. Tente recarregar a página.");
                setIsLoading(false);
            }
        }, 10000);

        try {
            const useCase = DIContainer.getNewslettersUseCase();
            const result = await useCase.execute();
            if (mountedRef.current) {
                setLatest(result.latest);
                setOlder(result.older);
            }
        } catch (err) {
            console.error("Erro ao carregar newsletters:", err);
            if (mountedRef.current) {
                setError("Erro ao carregar newsletters. Tente novamente.");
            }
        } finally {
            clearTimeout(timeoutId);
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchNewsletters();
    }, [fetchNewsletters]);

    return {
        latest,
        older,
        isLoading,
        error,
        refresh: fetchNewsletters,
    };
}
