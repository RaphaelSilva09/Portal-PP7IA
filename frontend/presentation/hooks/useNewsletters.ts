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

import { useCallback, useEffect, useState } from "react";
import { Newsletter } from "../../domain/entities/Newsletter";
import DIContainer from "../../infrastructure/di/container";

interface UseNewslettersResult {
    latest: Newsletter | null;
    older: Newsletter[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

/**
 * Hook customizado para newsletters
 * Custom Hook Pattern
 */
export function useNewsletters(): UseNewslettersResult {
    const [latest, setLatest] = useState<Newsletter | null>(null);
    const [older, setOlder] = useState<Newsletter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Busca newsletters do repositório
     */
    const fetchNewsletters = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const useCase = DIContainer.getNewslettersUseCase();
            const result = await useCase.execute();
            setLatest(result.latest);
            setOlder(result.older);
        } catch (err) {
            console.error("Erro ao carregar newsletters:", err);
            setError("Erro ao carregar newsletters. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Carrega newsletters na montagem do componente
     */
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
