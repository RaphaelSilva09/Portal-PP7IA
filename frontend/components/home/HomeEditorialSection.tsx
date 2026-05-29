"use client";

import { useEditorial } from "@/presentation/hooks/useEditorial";
import type { EditorialSlug } from "@/constants/editorials";

const CARD_META: Record<
    EditorialSlug,
    {
        icon: React.ReactNode;
        audienceTitle: string;
        cadenceLabel: string;
        cadenceColor: string;
    }
> = {
    "primeiros-usuarios": {
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
            </svg>
        ),
        audienceTitle: "Para quem está chegando agora",
        cadenceLabel: "Disponível",
        cadenceColor: "text-primary",
    },
    semanais: {
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden="true"
            >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
            </svg>
        ),
        audienceTitle: "Para quem acompanha o ritmo",
        cadenceLabel: "Toda quarta",
        cadenceColor: "text-muted-foreground",
    },
};

const SLUG_ORDER: EditorialSlug[] = ["primeiros-usuarios", "semanais"];

interface Props {
    label?: string;
    titleBefore?: string;
    titleEm?: string;
    description?: string;
}

export default function HomeEditorialSection({
    label = "Editorial",
    titleBefore = "Por onde ",
    titleEm = "começar",
    description = "Dois editoriais abertos. Escolha o ritmo conforme você chega.",
}: Props) {
    const { editorials } = useEditorial();

    const ordered = SLUG_ORDER.map((slug) =>
        editorials.find((e) => e.slug === slug),
    ).filter(Boolean) as typeof editorials;

    return (
        <section id="novidades" className="relative overflow-hidden border-t border-border bg-primary-soft/40 py-24">
            <svg className="pointer-events-none absolute inset-0 h-full w-full select-none" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <g transform="scale(-1,1) translate(-1440,0)">
                    {/* Circles */}
                    <circle cx="1530" cy="350" r="420" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.07" />
                    <circle cx="90" cy="90" r="150" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.07" />
                    <circle cx="-80" cy="720" r="280" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="5 4" opacity="0.07" />
                    {/* Diagonal */}
                    <line x1="280" y1="0" x2="580" y2="700" stroke="currentColor" strokeWidth="0.5" opacity="0.05" />
                    {/* Horizontal rules */}
                    <line x1="1060" y1="150" x2="1440" y2="150" stroke="currentColor" strokeWidth="0.5" opacity="0.07" />
                    <line x1="0" y1="550" x2="320" y2="550" stroke="currentColor" strokeWidth="0.5" opacity="0.06" />
                    {/* Crosses */}
                    <line x1="950" y1="98" x2="968" y2="98" stroke="currentColor" strokeWidth="1.2" opacity="0.13" />
                    <line x1="959" y1="89" x2="959" y2="107" stroke="currentColor" strokeWidth="1.2" opacity="0.13" />
                    <line x1="210" y1="560" x2="226" y2="560" stroke="currentColor" strokeWidth="1" opacity="0.11" />
                    <line x1="218" y1="552" x2="218" y2="568" stroke="currentColor" strokeWidth="1" opacity="0.11" />
                </g>
            </svg>
            <div className="relative mx-auto max-w-7xl px-6">
                <div className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                    {label}
                </div>
                <h2 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight text-ink md:text-6xl">
                    {titleBefore}
                    <em className="italic text-primary">{titleEm}</em>.
                </h2>
                <p className="mt-5 max-w-xl text-muted-foreground text-md">
                    {description}
                </p>
                <div className="mt-12 grid gap-4 md:grid-cols-2">
                    {ordered.map((editorial) => {
                        const meta = CARD_META[editorial.slug];
                        const isAvailable = editorial.available;

                        const inner = (
                            <>
                                <div className="flex items-center justify-between">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                                        {meta.icon}
                                    </div>
                                    <span
                                        className={`text-xs uppercase tracking-[0.2em] ${
                                            isAvailable
                                                ? meta.cadenceColor
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {isAvailable ? meta.cadenceLabel : "Em breve"}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                                        {editorial.audienceLabel}
                                    </div>
                                    <h3 className="mt-2 font-serif text-3xl text-ink">
                                        {meta.audienceTitle}
                                    </h3>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                        {editorial.description}
                                    </p>
                                </div>
                                {isAvailable ? (
                                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                        {editorial.ctaLabel}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="size-4 transition-transform group-hover:translate-x-1"
                                            aria-hidden="true"
                                        >
                                            <path d="M5 12h14" />
                                            <path d="m12 5 7 7-7 7" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="text-sm font-medium text-foreground/50">
                                        Disponível em breve
                                    </div>
                                )}
                            </>
                        );

                        if (isAvailable) {
                            return (
                                <a
                                    key={editorial.slug}
                                    href={editorial.href}
                                    className="group flex flex-col gap-6 rounded-3xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
                                >
                                    {inner}
                                </a>
                            );
                        }

                        return (
                            <div
                                key={editorial.slug}
                                className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-8 opacity-80"
                            >
                                {inner}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
