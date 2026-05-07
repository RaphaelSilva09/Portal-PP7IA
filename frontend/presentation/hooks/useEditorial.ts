/**
 * useEditorial Hook (Presentation Layer)
 *
 * Hook React para buscar o conteúdo editorial da página principal.
 * Consome o endpoint HTTP `/api/content/editorial` (GET).
 * O fluxo de salvar (PUT) é tratado nos próprios componentes admin.
 */

"use client";

import { useQuery } from "@tanstack/react-query";

interface UseEditorialResult {
    content: string;
    isLoading: boolean;
    error: string | null;
}

export function useEditorial(): UseEditorialResult {
    const { data, isLoading, error } = useQuery({
        queryKey: ["editorial"],
        queryFn: async () => {
            const res = await fetch("/api/content/editorial");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as { content?: string } | null;
            return json ?? null;
        },
        staleTime: 5 * 60 * 1000,
    });

    return {
        content: data?.content ?? "",
        isLoading,
        error: error ? "Erro ao carregar editorial." : null,
    };
}
