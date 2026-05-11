"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { MiniLivroSectionKind } from "@/domain/entities/MiniLivroSection";
import { supabaseAnon } from "@/infrastructure/config/supabase";

export interface SectionMeta {
    title: string;
    description: string;
}

interface MiniLivroSectionMeta {
    introducao: SectionMeta;
    encerramento: SectionMeta;
}

const DEFAULT_META: MiniLivroSectionMeta = {
    introducao: {
        title: "Introdução",
        description: "Antes de mergulhar nos capítulos, confira estes conteúdos introdutórios.",
    },
    encerramento: {
        title: "Encerramento",
        description: "Depois do último capítulo, seguem os blocos finais desta jornada.",
    },
};

export function useMiniLivroSectionMeta(): {
    meta: MiniLivroSectionMeta;
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
} {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["mini-livro-section-meta"],
        queryFn: async () => {
            const { data: rows, error } = await supabaseAnon
                .from("mini_livro_section_meta")
                .select("kind, title, description");

            if (error) {
                throw error;
            }

            const meta = { ...DEFAULT_META };

            for (const row of rows ?? []) {
                const kind = row.kind as MiniLivroSectionKind;
                if (kind === "introducao" || kind === "encerramento") {
                    meta[kind] = {
                        title: row.title || DEFAULT_META[kind].title,
                        description: row.description ?? DEFAULT_META[kind].description,
                    };
                }
            }

            return meta;
        },
        staleTime: 1000 * 60 * 5,
    });

    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["mini-livro-section-meta"] });
    }, [queryClient]);

    return {
        meta: data ?? DEFAULT_META,
        isLoading,
        error: error ? "Erro ao carregar metadados das seções." : null,
        refresh,
    };
}
