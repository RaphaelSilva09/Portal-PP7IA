"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Estudar } from "../../domain/entities/Estudar";
import DIContainer from "../../infrastructure/di/container";

interface UseEstudarResult {
    latest: Estudar | null;
    older: Estudar[];
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

export function useEstudar(): UseEstudarResult {
    const [latest, setLatest] = useState<Estudar | null>(null);
    const [older, setOlder] = useState<Estudar[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Evita state updates em componentes desmontados
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

        // Timeout de segurança: garante que isLoading nunca fica preso
        const timeoutId = setTimeout(() => {
            if (mountedRef.current) {
                console.warn("⚠️ useEstudar: timeout após 10s");
                setError("Tempo limite excedido. Tente recarregar a página.");
                setIsLoading(false);
            }
        }, 10000);

        try {
            const useCase = DIContainer.getEstudarUseCase();
            const result = await useCase.execute();
            if (mountedRef.current) {
                setLatest(result.latest);
                setOlder(result.older);
            }
        } catch (err) {
            console.error("Erro ao carregar estudar:", err);
            if (mountedRef.current) {
                setError("Erro ao carregar conteúdo de estudo.");
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

    return { latest, older, isLoading, error, reload: fetchData };
}
