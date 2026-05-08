/**
 * useEditorial Hook (Presentation Layer)
 *
 * Hook React para listar os editoriais fixos da página principal.
 */

"use client";

import {
    EDITORIAL_ITEMS,
    getEditorialFileName,
    getEditorialViewPath,
    type EditorialSlug,
} from "@/constants/editorials";
import { useQuery } from "@tanstack/react-query";

export interface EditorialLink {
    slug: EditorialSlug;
    title: string;
    description: string;
    audienceLabel: string;
    ctaLabel: string;
    href: string;
    available: boolean;
}

interface UseEditorialResult {
    editorials: EditorialLink[];
    isLoading: boolean;
    error: string | null;
}

export function useEditorial(): UseEditorialResult {
    const { data, isLoading, error } = useQuery({
        queryKey: ["editoriais"],
        queryFn: async () => {
            const res = await fetch("/api/content/editorials");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const payload = (await res.json()) as { files?: string[] };
            const availableFiles = new Set(payload.files ?? []);

            return EDITORIAL_ITEMS.map(item => ({
                ...item,
                href: getEditorialViewPath(item.slug),
                available: availableFiles.has(getEditorialFileName(item.slug)),
            }));
        },
        staleTime: 5 * 60 * 1000,
    });

    return {
        editorials: data ?? EDITORIAL_ITEMS.map(item => ({ ...item, href: getEditorialViewPath(item.slug), available: false })),
        isLoading,
        error: error ? "Erro ao carregar editoriais." : null,
    };
}
