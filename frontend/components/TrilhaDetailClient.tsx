"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Circle } from "lucide-react";
import Link from "next/link";
import { completedStepCount, nextUnreadStepIndex } from "@/domain/entities/ReadingTrail";
import type { ReadingTrailDetail } from "@/domain/entities/ReadingTrail";

interface TrilhaDetailClientProps {
    slug: string;
}

export default function TrilhaDetailClient({ slug }: TrilhaDetailClientProps) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["reading-trail", slug],
        queryFn: async () => {
            const res = await fetch(`/api/reading-trails/${slug}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return (await res.json()) as ReadingTrailDetail;
        },
    });

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Carregando…</p>;
    }

    if (error || !data) {
        return <p className="text-sm text-muted-foreground">Não foi possível carregar esta trilha.</p>;
    }

    const total = data.steps.length;
    const done = completedStepCount(data.steps);
    const nextIdx = nextUnreadStepIndex(data.steps);
    const progressPct = total === 0 ? 0 : Math.round((done / total) * 100);

    return (
        <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Trilha de leitura
            </p>
            <h1 className="mt-2 font-serif text-3xl tracking-tight text-ink md:text-4xl">{data.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{data.description}</p>

            <div className="mt-8 mb-6 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-accent">
                    <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">{done}/{total}</span>
            </div>

            {nextIdx !== null && (
                <Link
                    href={`${data.steps[nextIdx].href}?trilha=${slug}`}
                    className="mb-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-primary"
                >
                    {done === 0 ? "Começar trilha" : "Continuar trilha"}
                </Link>
            )}

            <ol className="flex flex-col gap-2">
                {data.steps.map((step, i) => (
                    <li key={`${step.contentType}-${step.contentId}`}>
                        <Link
                            href={`${step.href}?trilha=${slug}`}
                            className={[
                                "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                                step.completed
                                    ? "border-border/60 bg-accent/30 text-muted-foreground"
                                    : i === nextIdx
                                        ? "border-foreground/40 bg-background text-foreground"
                                        : "border-border bg-background text-foreground hover:border-foreground/40",
                            ].join(" ")}
                        >
                            {step.completed
                                ? <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                                : <Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                            <span className="text-xs font-medium text-muted-foreground">{i + 1}.</span>
                            <span className="text-sm font-medium">{step.title}</span>
                        </Link>
                    </li>
                ))}
            </ol>
        </div>
    );
}
