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

import { useEffect, useState } from "react";
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

    useEffect(() => {
        let cancelled = false;

        const timeoutId = setTimeout(() => {
            if (!cancelled) {
                console.warn("⚠️ usePortalNews: timeout após 10s");
                setError("Tempo limite excedido. Tente recarregar a página.");
                setIsLoading(false);
            }
        }, 10000);

        (async () => {
            try {
                const useCase = DIContainer.getPortalNewsUseCase();
                const result = await useCase.execute();
                if (!cancelled) {
                    setItems(result);
                }
            } catch (err) {
                console.error("Erro ao carregar novidades do portal:", err);
                if (!cancelled) {
                    setError("Erro ao carregar novidades.");
                }
            } finally {
                clearTimeout(timeoutId);
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, []);

    return { items, isLoading, error };
}
