"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Route } from "lucide-react";
import Link from "next/link";

interface TrailSummary {
    slug: string;
    title: string;
    description: string;
    coverImagePath: string | null;
    itemCount: number;
}

const CARD_COLORS = ["var(--block-radar)", "var(--block-newsletter)", "var(--block-biblioteca)"];

function TrailPreviewCard({ trail, color }: { trail: TrailSummary; color: string }) {
    const steps = Math.min(trail.itemCount, 6);
    return (
        <Link
            href={`/trilhas/${trail.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background p-6 transition hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[var(--shadow-elevated)]"
        >
            <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: color, color: "white" }}
            >
                <Route className="size-5" aria-hidden="true" />
            </div>

            <h3 className="mt-5 font-serif text-2xl leading-[1.2] tracking-[-0.01em] text-ink transition-colors group-hover:text-primary">
                {trail.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {trail.description}
            </p>

            <div className="mt-6 flex items-center gap-3">
                <div className="flex gap-1" aria-hidden="true">
                    {Array.from({ length: steps }, (_, i) => (
                        <span key={i} className="h-1.5 w-4 rounded-full" style={{ backgroundColor: color, opacity: 0.25 + (i === 0 ? 0.6 : 0) }} />
                    ))}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                    {trail.itemCount} {trail.itemCount === 1 ? "leitura" : "leituras"}
                </span>
            </div>
        </Link>
    );
}

export default function HomeTrilhasSection() {
    const { data } = useQuery({
        queryKey: ["reading-trails"],
        queryFn: async () => {
            const res = await fetch("/api/reading-trails");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            return json.trails as TrailSummary[];
        },
    });

    const trails = data ?? [];
    if (trails.length === 0) return null;

    return (
        <section className="border-t border-border bg-accent/20 py-20">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Percursos guiados</p>
                        <h2 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight text-ink md:text-5xl">
                            Trilhas de leitura.
                        </h2>
                        <p className="mt-4 max-w-md text-muted-foreground">
                            Sequências curadas de conteúdos do portal, com um objetivo — do primeiro passo ao último.
                        </p>
                    </div>
                    <Link
                        href="/trilhas"
                        className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition hover:bg-primary"
                    >
                        Explorar trilhas
                        <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                </div>

                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {trails.slice(0, 3).map((trail, i) => (
                        <TrailPreviewCard key={trail.slug} trail={trail} color={CARD_COLORS[i % CARD_COLORS.length]} />
                    ))}
                </div>
            </div>
        </section>
    );
}
