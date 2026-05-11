"use client";

/**
 * useSearch Hook (Presentation Layer)
 *
 * Abstrai busca de conteúdo com debounce de 300ms e proteção contra
 * race conditions via requestVersion — resultados de requests mais
 * antigas são descartados se uma nova query chegar antes da resposta.
 * Consome o endpoint HTTP `POST /api/search`.
 *
 * Princípios aplicados:
 * - SRP: Única responsabilidade — gerenciar estado de busca
 * - DRY: Centraliza lógica de debounce + cancelamento para todos os consumers
 */

import { useEffect, useRef, useState } from "react";
import type { SearchFilter, SearchResultItem } from "../../application/usecases/SearchContentUseCase";

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
        const abortController = new AbortController();
        setIsLoading(true);
        setError(null);

        const timeoutId = setTimeout(async () => {
            try {
                const res = await fetch("/api/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query, filter }),
                    signal: abortController.signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = (await res.json()) as { results: SearchResultItem[] };

                // Descarta resultado se chegou antes de uma versão mais nova
                if (version !== requestVersion.current) return;

                setResults(json.results ?? []);
            } catch (err) {
                if (version !== requestVersion.current) return;
                if (err instanceof DOMException && err.name === "AbortError") return;
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
            abortController.abort();
        };
    }, [query, filter]);

    return { results, isLoading, error };
}
