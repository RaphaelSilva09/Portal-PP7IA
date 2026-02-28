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

import { useCallback, useEffect, useRef, useState } from "react";
import { BibliotecaItem } from "../../domain/entities/BibliotecaItem";
import DIContainer from "../../infrastructure/di/container";

interface UseBibliotecaResult {
    latest: BibliotecaItem | null;
    older: BibliotecaItem[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useBiblioteca(): UseBibliotecaResult {
    const [latest, setLatest] = useState<BibliotecaItem | null>(null);
    const [older, setOlder] = useState<BibliotecaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fetchBiblioteca = useCallback(async () => {
        if (!mountedRef.current) return;
        setIsLoading(true);
        setError(null);

        const timeoutId = setTimeout(() => {
            if (mountedRef.current) {
                console.warn("⚠️ useBiblioteca: timeout após 10s");
                setError("Tempo limite excedido. Tente recarregar a página.");
                setIsLoading(false);
            }
        }, 10000);

        try {
            const useCase = DIContainer.getBibliotecaUseCase();
            const result = await useCase.execute();
            if (mountedRef.current) {
                setLatest(result.latest);
                setOlder(result.older);
            }
        } catch (err) {
            console.error("Erro ao carregar biblioteca:", err);
            if (mountedRef.current) {
                setError("Erro ao carregar biblioteca. Tente novamente.");
            }
        } finally {
            clearTimeout(timeoutId);
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

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
