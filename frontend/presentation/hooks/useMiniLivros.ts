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

import { useCallback, useEffect, useState } from "react";
import { MiniLivro } from "../../domain/entities/MiniLivro";
import DIContainer from "../../infrastructure/di/container";

interface UseMiniLivrosResult {
    latest: MiniLivro | null;
    older: MiniLivro[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

/**
 * Hook customizado para mini-livros
 * Custom Hook Pattern
 */
export function useMiniLivros(): UseMiniLivrosResult {
    const [latest, setLatest] = useState<MiniLivro | null>(null);
    const [older, setOlder] = useState<MiniLivro[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Busca mini-livros do repositório
     */
    const fetchMiniLivros = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const useCase = DIContainer.getMiniLivrosUseCase();
            const result = await useCase.execute();
            setLatest(result.latest);
            setOlder(result.older);
        } catch (err) {
            console.error("Erro ao carregar mini-livros:", err);
            setError("Erro ao carregar mini-livros. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Carrega mini-livros na montagem do componente
     */
    useEffect(() => {
        fetchMiniLivros();
    }, [fetchMiniLivros]);

    return {
        latest,
        older,
        isLoading,
        error,
        refresh: fetchMiniLivros,
    };
}
