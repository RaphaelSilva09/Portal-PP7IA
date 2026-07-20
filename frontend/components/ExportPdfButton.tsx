"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface ExportPdfButtonProps {
    contentType: string;
    slug: string;
}

export default function ExportPdfButton({ contentType, slug }: ExportPdfButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [failed, setFailed] = useState(false);

    const handleClick = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setFailed(false);

        try {
            const res = await fetch(`/api/export-pdf/${contentType}/${slug}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `pp7ias-${contentType}-${slug}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch {
            setFailed(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isLoading}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
            aria-label={isLoading ? "Gerando PDF…" : failed ? "Falha ao gerar PDF, tentar de novo" : "Exportar para PDF"}
            title={failed ? "Falha ao gerar PDF — clique para tentar de novo" : "Exportar para PDF"}
        >
            {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
                <Download className="size-3.5" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
                {isLoading ? "Gerando…" : failed ? "Tentar de novo" : "Exportar PDF"}
            </span>
        </button>
    );
}
