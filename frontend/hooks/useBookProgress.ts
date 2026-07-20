"use client";

import { useEffect, useState } from "react";
import { loadBookProgress, type BookProgress } from "@/lib/bookProgress";

/** Progresso de leitura do livro salvo neste dispositivo — só populado após o mount, para não divergir da renderização do servidor (localStorage não existe lá). */
export function useBookProgress(): BookProgress | null {
    const [progress, setProgress] = useState<BookProgress | null>(null);

    useEffect(() => {
        setProgress(loadBookProgress());
    }, []);

    return progress;
}
