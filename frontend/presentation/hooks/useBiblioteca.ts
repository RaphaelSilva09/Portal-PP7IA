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
 * - Clean Architecture: Camada de apresentação consome HTTP API
 * - React Query: Cache automático, retry e cancelamento na desmontagem
 */

"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BibliotecaItem, BIBLIOTECA_TEMAS } from "../../domain/entities/BibliotecaItem";
import type { BibliotecaItemProps, BibliotecaTema } from "../../domain/entities/BibliotecaItem";

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
    refresh: () => void;
}

/**
 * O backend serializa instâncias da entidade como `{ props: {...} }` (campo
 * privado da classe vira chave pública após JSON.stringify). Aqui rehidratamos
 * para uma instância real, convertendo strings ISO de volta para Date.
 */
function rehydrateItem(raw: unknown): BibliotecaItem {
    const props = (raw as { props?: BibliotecaItemProps })?.props ?? (raw as BibliotecaItemProps);
    return BibliotecaItem.create({
        ...props,
        createdAt: props.createdAt ? new Date(props.createdAt) : new Date(0),
    });
}

export function useBiblioteca(): UseBibliotecaResult {
    const queryClient = useQueryClient();
    const [activeTema, setActiveTema] = useState<BibliotecaTema | null>(BIBLIOTECA_TEMAS[0].slug);

    const { data, isLoading, error } = useQuery({
        queryKey: ["biblioteca"],
        queryFn: async () => {
            const res = await fetch("/api/content/biblioteca");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as {
                latest: unknown;
                older: unknown[];
                lastUpdated: string | null;
            };
            return {
                latest: json.latest ? rehydrateItem(json.latest) : null,
                older: (json.older ?? []).map(rehydrateItem),
                lastUpdated: json.lastUpdated ? new Date(json.lastUpdated) : null,
            };
        },
    });

    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["biblioteca"] });
    }, [queryClient]);

    const latest = data?.latest ?? null;
    const older = data?.older ?? [];
    const lastUpdated = data?.lastUpdated ?? null;

    // Filtragem client-side por tema (null = Todos)
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
        error: error ? "Erro ao carregar biblioteca. Tente novamente." : null,
        lastUpdated,
        refresh,
    };
}
