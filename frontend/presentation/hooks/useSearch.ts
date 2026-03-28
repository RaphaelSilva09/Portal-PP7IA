"use client";

/**
 * useSearch Hook (Presentation Layer)
 *
 * Abstrai busca de conteúdo com debounce de 300ms e proteção contra
 * race conditions via requestVersion — resultados de requests mais
 * antigas são descartados se uma nova query chegar antes da resposta.
 *
 * Princípios aplicados:
 * - SRP: Única responsabilidade — gerenciar estado de busca
 * - DRY: Centraliza lógica de debounce + cancelamento para todos os consumers
 */

import { useEffect, useRef, useState } from "react";
import type { SearchFilter, SearchResultItem } from "../../application/usecases/SearchContentUseCase";
import DIContainer from "../../infrastructure/di/container";

export type { SearchFilter, SearchResultItem };

interface UseSearchResult {
    results: SearchResultItem[];
    isLoading: boolean;
    error: string | null;
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

export function useSearch(query: string, filter: SearchFilter): UseSearchResult {
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Contador monotonicamente crescente.
     * Descarta resultados de requests em voo quando a query muda antes
     * da resposta chegar — evita resultados fora de ordem em conexões lentas.
     */
    const requestVersion = useRef(0);

    useEffect(() => {
        if (query.trim().length < MIN_QUERY_LENGTH) {
            setResults([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        const version = ++requestVersion.current;
        setIsLoading(true);
        setError(null);

        const timeoutId = setTimeout(async () => {
            try {
                const useCase = DIContainer.getSearchContentUseCase();
                const data = await useCase.execute({ query, filter });

                // Descarta resultado se chegou antes de uma versão mais nova
                if (version !== requestVersion.current) return;

                setResults(data);
            } catch (err) {
                if (version !== requestVersion.current) return;
                setError(err instanceof Error ? err.message : "Erro ao buscar conteúdo.");
                setResults([]);
            } finally {
                if (version === requestVersion.current) {
                    setIsLoading(false);
                }
            }
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [query, filter]);

    return { results, isLoading, error };
}
