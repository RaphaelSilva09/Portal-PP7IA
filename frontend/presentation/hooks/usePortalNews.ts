/**
 * usePortalNews Hook (Presentation Layer)
 *
 * Hook React para gerenciar dados das novidades do portal.
 *
 * Princípios aplicados:
 * - Facade Pattern: Simplifica interface para componentes
 * - SRP: Responsável apenas por gerenciar estado das novidades
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PortalNewsItem } from "../../domain/entities/PortalNewsItem";
import DIContainer from "../../infrastructure/di/container";

interface UsePortalNewsResult {
    items: PortalNewsItem[];
    isLoading: boolean;
    error: string | null;
}

export function usePortalNews(): UsePortalNewsResult {
    const [items, setItems] = useState<PortalNewsItem[]>([]);
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
                console.warn("⚠️ usePortalNews: timeout após 10s");
                setError("Tempo limite excedido. Tente recarregar a página.");
                setIsLoading(false);
            }
        }, 10000);

        try {
            const useCase = DIContainer.getPortalNewsUseCase();
            const result = await useCase.execute();
            if (mountedRef.current) {
                setItems(result);
            }
        } catch (err) {
            console.error("Erro ao carregar novidades do portal:", err);
            if (mountedRef.current) {
                setError("Erro ao carregar novidades.");
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

    return { items, isLoading, error };
}
