/**
 * useEditorial Hook (Presentation Layer)
 *
 * Hook React para listar os editoriais fixos da página principal.
 */

"use client";

import {
    EDITORIAL_ITEMS,
    EDITORIAL_STORAGE_BUCKET,
    EDITORIAL_STORAGE_FOLDER,
    getEditorialFileName,
    getEditorialViewPath,
    type EditorialSlug,
} from "@/constants/editorials";
import { supabase } from "@/infrastructure/config/supabase";
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
            const { data, error } = await supabase.storage
                .from(EDITORIAL_STORAGE_BUCKET)
                .list(EDITORIAL_STORAGE_FOLDER, { limit: 100 });

            if (error) {
                throw error;
            }

            const availableFiles = new Set((data ?? []).map(item => item.name));

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
