/**
 * useMiniLivros Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados de mini-livros.
 * Fornece interface simples para componentes consumirem casos de uso.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado de mini-livros
 * - Clean Architecture: Camada de apresentação depende de casos de uso
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MiniLivro } from "../../domain/entities/MiniLivro";
import DIContainer from "../../infrastructure/di/container";

interface UseMiniLivrosResult {
    latest: MiniLivro | null;
    older: MiniLivro[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refresh: () => Promise<void>;
}

export function useMiniLivros(): UseMiniLivrosResult {
    const [latest, setLatest] = useState<MiniLivro | null>(null);
    const [older, setOlder] = useState<MiniLivro[]>([]);
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

    const fetchMiniLivros = useCallback(async () => {
        if (!mountedRef.current) return;
        setIsLoading(true);
        setError(null);

        const timeoutId = setTimeout(() => {
            if (mountedRef.current) {
                console.warn("⚠️ useMiniLivros: timeout após 10s");
                setError("Tempo limite excedido. Tente recarregar a página.");
                setIsLoading(false);
            }
        }, 10000);

        try {
            const useCase = DIContainer.getMiniLivrosUseCase();
            const repo = DIContainer.getContentRepository();
            const [result, lu] = await Promise.all([useCase.execute(), repo.getLastUpdated("mini-livro")]);
            if (mountedRef.current) {
                setLatest(result.latest);
                setOlder(result.older);
                setLastUpdated(lu);
            }
        } catch (err) {
            console.error("Erro ao carregar mini-livros:", err);
            if (mountedRef.current) {
                setError("Erro ao carregar mini-livros. Tente novamente.");
            }
        } finally {
            clearTimeout(timeoutId);
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchMiniLivros();
    }, [fetchMiniLivros]);

    return {
        latest,
        older,
        isLoading,
        error,
        lastUpdated,
        refresh: fetchMiniLivros,
    };
}
