/**
 * useBiblioteca Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados da biblioteca.
 * Fornece interface simples para componentes consumirem casos de uso.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado da biblioteca
 * - Clean Architecture: Camada de apresentação depende de casos de uso
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { BibliotecaItem } from "../../domain/entities/BibliotecaItem";
import DIContainer from "../../infrastructure/di/container";

interface UseBibliotecaResult {
    latest: BibliotecaItem | null;
    older: BibliotecaItem[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

/**
 * Hook customizado para biblioteca
 * Custom Hook Pattern
 */
export function useBiblioteca(): UseBibliotecaResult {
    const [latest, setLatest] = useState<BibliotecaItem | null>(null);
    const [older, setOlder] = useState<BibliotecaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Busca itens da biblioteca do repositório
     */
    const fetchBiblioteca = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const useCase = DIContainer.getBibliotecaUseCase();
            const result = await useCase.execute();
            setLatest(result.latest);
            setOlder(result.older);
        } catch (err) {
            console.error("Erro ao carregar biblioteca:", err);
            setError("Erro ao carregar biblioteca. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Carrega biblioteca na montagem do componente
     */
    useEffect(() => {
        fetchBiblioteca();
    }, [fetchBiblioteca]);

    return {
        latest,
        older,
        isLoading,
        error,
        refresh: fetchBiblioteca,
    };
}
