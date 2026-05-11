"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    MiniLivroSection,
    type MiniLivroSectionKind,
    type MiniLivroSectionProps,
} from "@/domain/entities/MiniLivroSection";

interface UseMiniLivroSectionsResult {
    introducoes: MiniLivroSection[];
    encerramentos: MiniLivroSection[];
    all: MiniLivroSection[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

function rehydrate(raw: unknown): MiniLivroSection | null {
    const data = raw as { props?: Partial<MiniLivroSectionProps> } & Partial<MiniLivroSectionProps>;
    const src = (data?.props ?? data) as Partial<MiniLivroSectionProps>;
    if (typeof src.id !== "number" || typeof src.title !== "string") return null;
    if (src.kind !== "introducao" && src.kind !== "encerramento") return null;
    return MiniLivroSection.create({
        id: src.id,
        createdAt: src.createdAt ? new Date(src.createdAt as unknown as string) : new Date(0),
        updatedAt: src.updatedAt ? new Date(src.updatedAt as unknown as string) : new Date(0),
        kind: src.kind as MiniLivroSectionKind,
        title: src.title,
        description: (src.description as string | null) ?? null,
        htmlPath: (src.htmlPath as string | null) ?? null,
        index: typeof src.index === "number" ? src.index : 0,
    });
}

export function useMiniLivroSections(): UseMiniLivroSectionsResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["mini-livro-sections"],
        queryFn: async () => {
            const res = await fetch("/api/content/mini-livro-sections");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const payload = (await res.json()) as {
                introducoes?: unknown[];
                encerramentos?: unknown[];
                all?: unknown[];
            };
            return {
                introducoes: (payload.introducoes ?? []).map(rehydrate).filter((s): s is MiniLivroSection => s !== null),
                encerramentos: (payload.encerramentos ?? []).map(rehydrate).filter((s): s is MiniLivroSection => s !== null),
                all: (payload.all ?? []).map(rehydrate).filter((s): s is MiniLivroSection => s !== null),
            };
        },
    });

    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["mini-livro-sections"] });
    }, [queryClient]);

    return {
        introducoes: data?.introducoes ?? [],
        encerramentos: data?.encerramentos ?? [],
        all: data?.all ?? [],
        isLoading,
        error: error ? "Erro ao carregar seções extras dos mini-livros." : null,
        refresh,
    };
}
