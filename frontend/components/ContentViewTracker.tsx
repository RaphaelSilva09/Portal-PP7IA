"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BOOK_CONTENT_TYPES, saveBookProgress } from "@/lib/bookProgress";
import { markSeen } from "@/lib/seenContent";

interface ContentViewTrackerProps {
    contentType: string;
    title: string;
}

/**
 * Registra localmente a visita a um conteúdo em /view.
 * Alimenta o "continue de onde parou" (universo do livro) e o
 * alerta de conteúdo atualizado desde a última leitura (todos os tipos).
 *
 * Para leitores logados, também sinaliza ao servidor a primeira
 * visualização de conteúdo (uma vez por sessão de página) — sinal de
 * engajamento usado pela fundação de rastreamento de indicação (PDF 6.4).
 */
export default function ContentViewTracker({ contentType, title }: ContentViewTrackerProps) {
    const pathname = usePathname();
    const { user } = useAuth();
    const hasReportedView = useRef(false);

    useEffect(() => {
        if (!pathname) return;
        markSeen(pathname);
        if (BOOK_CONTENT_TYPES.has(contentType)) {
            saveBookProgress({ href: pathname, title, type: contentType });
        }
    }, [pathname, contentType, title]);

    useEffect(() => {
        if (!user || hasReportedView.current) return;
        hasReportedView.current = true;
        fetch("/api/content-views", { method: "POST" }).catch(() => {});
    }, [user]);

    return null;
}
