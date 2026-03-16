/**
 * useBiblioteca Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados da biblioteca.
 * Fornece interface simples para componentes consumirem casos de uso.
 * Suporta filtragem client-side por tema.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado da biblioteca
 * - Clean Architecture: Camada de apresentação depende de casos de uso
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BibliotecaItem } from "../../domain/entities/BibliotecaItem";
import type { BibliotecaTema } from "../../domain/entities/BibliotecaItem";
import DIContainer from "../../infrastructure/di/container";

interface UseBibliotecaResult {
    latest: BibliotecaItem | null;
    older: BibliotecaItem[];
    /** Item em destaque para o tema ativo (ou global quando "Todos") */
    activeLatest: BibliotecaItem | null;
    /** Demais itens do tema ativo, excluindo o destaque */
    filteredOlder: BibliotecaItem[];
    activeTema: BibliotecaTema | null;
    setActiveTema: (tema: BibliotecaTema | null) => void;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refresh: () => Promise<void>;
}

export function useBiblioteca(): UseBibliotecaResult {
    const [latest, setLatest] = useState<BibliotecaItem | null>(null);
    const [older, setOlder] = useState<BibliotecaItem[]>([]);
    const [activeTema, setActiveTema] = useState<BibliotecaTema | null>(null);
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
            const repo = DIContainer.getContentRepository();
            const [result, lu] = await Promise.all([useCase.execute(), repo.getLastUpdated("biblioteca")]);
            if (mountedRef.current) {
                setLatest(result.latest);
                setOlder(result.older);
                setLastUpdated(lu);
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

    // Filtragem client-side por tema (null = Todos)
    // allItems = latest + older em ordem cronológica (latest já é o primeiro)
    const allItems = latest ? [latest, ...older] : older;

    const activeLatest: BibliotecaItem | null = activeTema
        ? (allItems.find(item => item.tema === activeTema) ?? null)
        : latest;

    const filteredOlder: BibliotecaItem[] = activeTema
        ? allItems.filter(item => item.tema === activeTema && item !== activeLatest)
        : older;

    return {
        latest,
        older,
        activeLatest,
        filteredOlder,
        activeTema,
        setActiveTema,
        isLoading,
        error,
        lastUpdated,
        refresh: fetchBiblioteca,
    };
}
