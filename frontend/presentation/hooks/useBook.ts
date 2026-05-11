/**
 * useBook Hook (Presentation Layer)
 *
 * Hook React para carregar o Livro Principal (singleton ativo na tabela book).
 * Consome o endpoint HTTP `/api/content/book/active`.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { Book } from "../../domain/entities/Book";
import type { BookProps } from "../../domain/entities/Book";

interface UseBookResult {
    book: Book | null;
    isLoading: boolean;
    error: string | null;
}

/**
 * O backend serializa instâncias da entidade como `{ props: {...} }` (campo
 * privado da classe vira chave pública após JSON.stringify). Aqui rehidratamos
 * para uma instância real. Book não possui campos Date, então não há conversão.
 */
function rehydrateBook(raw: unknown): Book | null {
    if (!raw) return null;
    const props = (raw as { props?: BookProps })?.props ?? (raw as BookProps);
    return Book.create(props);
}

export function useBook(): UseBookResult {
    const { data, isLoading, error } = useQuery({
        queryKey: ["active-book"],
        queryFn: async () => {
            const res = await fetch("/api/content/book/active");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as { book: unknown };
            return rehydrateBook(json.book);
        },
    });

    return {
        book: data ?? null,
        isLoading,
        error: error ? "Erro ao carregar o livro em destaque." : null,
    };
}
