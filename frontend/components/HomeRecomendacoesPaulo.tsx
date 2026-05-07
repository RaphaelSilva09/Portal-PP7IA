"use client";

import Link from "next/link";
import { BookOpenCheck, ArrowUpRight } from "lucide-react";
import { portalContentClass } from "@/lib/layout";
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
        <section id="recomendacoes-paulo" className="py-8" style={{ scrollMarginTop: "100px" }}>
            <div className={portalContentClass}>
                <div className="w-full h-px bg-linear-to-r from-transparent via-border to-transparent" />

                <Link
                    href={getRecomendacoesPauloViewPath()}
                    className="group relative mt-8 overflow-hidden rounded-2xl border border-border hover:border-cyan-500/40 transition-all duration-300 block bg-card/85"
                    aria-label="Abrir recomendacoes do Paulo"
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.10) 100%)",
                        }}
                    />
                    <div className="relative z-10 p-6 text-center">
                        <ArrowUpRight className="absolute top-4 right-4 w-5 h-5 text-emerald-700/70 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />

                        <div className="flex flex-col items-center gap-2 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                                <BookOpenCheck className="w-5 h-5 text-emerald-900" />
                            </div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                                    {data.title}
                                </h2>
                            </div>
                        </div>

                        <p className="text-sm text-text-secondary italic mb-4 text-center">
                            {descriptionText}
                        </p>

                        <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />

                        <div className="mt-4 flex justify-center">
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-700/10 px-4 py-2 text-sm font-semibold text-emerald-950">
                                Abrir recomendacoes
                                <ArrowUpRight className="w-4 h-4 text-emerald-950" />
                            </span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-600 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </Link>

            </div>
        </section>
    );
}
