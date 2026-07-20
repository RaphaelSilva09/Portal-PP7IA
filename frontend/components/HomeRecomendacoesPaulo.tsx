"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useHomeRecomendacoesPaulo } from "@/presentation/hooks/useHomeRecomendacoesPaulo";
import { getRecomendacoesPauloViewPath } from "@/constants/recomendacoesPaulo";

export default function HomeRecomendacoesPaulo() {
    const { data } = useHomeRecomendacoesPaulo();
    const lines = data.description.split("\n").filter(Boolean);
    const descriptionText = lines.join(" ");

    if (!data.available) {
        return null;
    }

    return (
        <section id="recomendacoes-paulo" className="border-t border-border bg-primary-soft/40 py-16" style={{ scrollMarginTop: "100px" }}>
            <div className="mx-auto max-w-7xl px-6">
                <Link
                    href={getRecomendacoesPauloViewPath()}
                    className="group relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-border bg-card p-8 transition hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] md:flex-row md:items-center md:justify-between md:p-10"
                    aria-label="Abrir recomendações do Paulo"
                >
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background: "radial-gradient(55% 90% at 100% 50%, color-mix(in oklab, var(--block-livro) 12%, transparent), transparent)",
                        }}
                    />

                    <div className="relative flex-1">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Curadoria Pessoal</div>
                        <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-ink md:text-4xl">
                            {data.title}
                        </h2>
                        <p className="mt-3 max-w-xl text-sm italic leading-relaxed text-muted-foreground">
                            {descriptionText}
                        </p>
                    </div>

                    <div className="relative shrink-0">
                        <span className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-ink transition-colors group-hover:border-foreground/40">
                            Ver recomendações
                            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                    </div>
                </Link>
            </div>
        </section>
    );
}
