"use client";

import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { useBookProgress } from "@/hooks/useBookProgress";

/**
 * "Continue de onde parou" (PDF 5.4) — aparece sob o card do livro na home
 * quando há um capítulo/seção do livro acessado anteriormente neste dispositivo.
 */
export default function ContinueReadingLink() {
    const progress = useBookProgress();

    if (!progress) return null;

    return (
        <Link
            href={progress.href}
            className="group -mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
            <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
                Continuar de onde parou:{" "}
                <span className="font-medium text-foreground">{progress.title}</span>
            </span>
            <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
    );
}
