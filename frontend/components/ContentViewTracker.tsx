"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { BOOK_CONTENT_TYPES, saveBookProgress } from "@/lib/bookProgress";
import { markSeen } from "@/lib/seenContent";

interface ContentViewTrackerProps {
    contentType: string;
    title: string;
    /** ID do conteúdo — usado para marcar progresso em trilhas de leitura (ver /api/reading-trails/progress). */
    contentId?: string;
}

/**
 * Registra localmente a visita a um conteúdo em /view.
 * Alimenta o "continue de onde parou" (universo do livro) e o
 * alerta de conteúdo atualizado desde a última leitura (todos os tipos).
 *
 * Para leitores logados, também sinaliza ao servidor a primeira
 * visualização de conteúdo (uma vez por sessão de página) — sinal de
 * engajamento usado pela fundação de rastreamento de indicação (PDF 6.4) — e
 * marca o progresso em qualquer trilha de leitura que contenha este conteúdo
 * (no-op silencioso quando não pertence a nenhuma).
 */
export default function ContentViewTracker({ contentType, title, contentId }: ContentViewTrackerProps) {
    const pathname = usePathname();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const hasReportedView = useRef(false);
    const hasReportedProgress = useRef(false);

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

    useEffect(() => {
        if (!user || !contentId || hasReportedProgress.current) return;
        hasReportedProgress.current = true;
        fetch("/api/reading-trails/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentType, contentId }),
        })
            // Invalida qualquer trilha em cache — sem isso, o check só aparece quando
            // o staleTime (30s) expirar ou a aba ganhar foco de novo (Providers.tsx).
            .then(res => { if (res.ok) queryClient.invalidateQueries({ queryKey: ["reading-trail"] }); })
            .catch(() => {});
    }, [user, contentType, contentId, queryClient]);

    return null;
}
