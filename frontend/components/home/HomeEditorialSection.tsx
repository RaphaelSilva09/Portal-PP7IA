"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useEditorial } from "@/presentation/hooks/useEditorial";
import type { EditorialLink } from "@/presentation/hooks/useEditorial";
import type { EditorialSlug } from "@/constants/editorials";

const CARD_META: Record<
    EditorialSlug,
    {
        icon: React.ReactNode;
        audienceTitle: string;
        cadenceLabel: string;
    }
> = {
    "primeiros-usuarios": {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
            </svg>
        ),
        audienceTitle: "Para quem está chegando agora",
        cadenceLabel: "Disponível",
    },
    semanais: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
            </svg>
        ),
        audienceTitle: "Para quem acompanha o ritmo",
        cadenceLabel: "Toda semana",
    },
};

const SLUG_ORDER: EditorialSlug[] = ["primeiros-usuarios", "semanais"];

const ArrowIcon = ({ className = "size-4" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

/** Fundo decorativo compartilhado pelas duas variantes — mesma linguagem visual do IAsSection/HeroSection. */
function SectionBackdrop() {
    return (
        <svg className="pointer-events-none absolute inset-0 h-full w-full select-none text-ink" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <circle cx="1530" cy="350" r="420" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.07" />
            <circle cx="-80" cy="80" r="220" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.06" />
            <line x1="1060" y1="150" x2="1440" y2="150" stroke="currentColor" strokeWidth="0.5" opacity="0.06" />
            <line x1="0" y1="550" x2="320" y2="550" stroke="currentColor" strokeWidth="0.5" opacity="0.05" />
        </svg>
    );
}

function SectionHeading({ label, titleBefore, titleEm, description }: {
    label: string;
    titleBefore: string;
    titleEm: string;
    description: string;
}) {
    return (
        <div>
            <div className="text-sm uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
            <h2 className="mt-4 font-serif text-4xl leading-[1.08] tracking-tight text-ink md:text-5xl">
                {titleBefore}
                <em className="italic text-primary">{titleEm}</em>.
            </h2>
            <p className="mt-5 max-w-md text-muted-foreground">{description}</p>
        </div>
    );
}

/** Card único, em destaque — usado quando só há um editorial disponível. */
function FeaturedEditorialCard({ editorial }: { editorial: EditorialLink }) {
    const meta = CARD_META[editorial.slug];
    const htmlAvailable = editorial.available;
    return (
        <div
            className="relative flex flex-col gap-8 overflow-hidden rounded-3xl p-8 text-background transition-transform hover:-translate-y-1 md:p-10"
            style={{ backgroundColor: "var(--ink)" }}
        >
            <svg className="pointer-events-none absolute inset-0 h-full w-full select-none" viewBox="0 0 460 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <circle cx="430" cy="20" r="180" fill="none" stroke="white" strokeWidth="1" opacity="0.12" />
                <circle cx="10" cy="300" r="110" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.10" />
            </svg>
            <div className="relative flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-background/10 text-background">
                    {meta.icon}
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-background/60">
                    {meta.cadenceLabel}
                </span>
            </div>
            <div className="relative">
                <div className="text-xs font-medium uppercase tracking-[0.22em] text-background/60">
                    {editorial.audienceLabel}
                </div>
                <h3 className="mt-3 font-serif text-3xl leading-tight text-background md:text-4xl">
                    {meta.audienceTitle}
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-background/75">
                    {editorial.description}
                </p>
            </div>
            <div className="relative flex flex-wrap items-center gap-3">
                {htmlAvailable && (
                    <Link
                        href={editorial.href}
                        className="group/cta inline-flex items-center gap-2 text-sm font-medium text-background"
                    >
                        {editorial.ctaLabel}
                        <ArrowIcon className="size-4 transition-transform group-hover/cta:translate-x-1" />
                    </Link>
                )}
                {editorial.pdfAvailable && (
                    <a
                        href={editorial.pdfHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                            htmlAvailable
                                ? "inline-flex items-center gap-1.5 rounded-full border border-background/25 px-3.5 py-1.5 text-xs font-medium text-background transition hover:bg-background/10"
                                : "inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-background/90"
                        }
                    >
                        <FileText className="size-4" aria-hidden="true" />
                        Baixar PDF
                    </a>
                )}
            </div>
        </div>
    );
}

/** Card compacto — usado lado a lado quando os dois editoriais estão disponíveis. */
function CompactEditorialCard({ editorial }: { editorial: EditorialLink }) {
    const meta = CARD_META[editorial.slug];
    const htmlAvailable = editorial.available;
    return (
        <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-8 transition hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
            <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    {meta.icon}
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                    {meta.cadenceLabel}
                </span>
            </div>
            <div>
                <div className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                    {editorial.audienceLabel}
                </div>
                <h3 className="mt-2 font-serif text-3xl text-ink">{meta.audienceTitle}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {editorial.description}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                {htmlAvailable && (
                    <Link
                        href={editorial.href}
                        className="group/cta inline-flex items-center gap-2 text-sm font-medium text-primary"
                    >
                        {editorial.ctaLabel}
                        <ArrowIcon className="size-4 transition-transform group-hover/cta:translate-x-1" />
                    </Link>
                )}
                {editorial.pdfAvailable && (
                    <a
                        href={editorial.pdfHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                            htmlAvailable
                                ? "inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
                                : "inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-primary"
                        }
                    >
                        <FileText className="size-4" aria-hidden="true" />
                        Baixar PDF
                    </a>
                )}
            </div>
        </div>
    );
}

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
    description = "Um editorial de entrada, pensado para o momento em que você está com o portal.",
}: Props) {
    const { editorials } = useEditorial();

    const ordered = (SLUG_ORDER.map(slug => editorials.find(e => e.slug === slug)).filter(Boolean) as typeof editorials)
        // Placeholders "Em breve" não ocupam a seção — só editoriais com HTML ou PDF real aparecem.
        .filter(editorial => editorial.available || editorial.pdfAvailable);

    if (ordered.length === 0) return null;

    // ── Um único editorial: texto à esquerda, card em destaque à direita (empilha no mobile) ──
    if (ordered.length === 1) {
        return (
            <section id="editoriais" className="relative overflow-hidden border-t border-border bg-primary-soft/40 py-20 md:py-24">
                <SectionBackdrop />
                <div className="relative mx-auto max-w-7xl px-6">
                    <div className="grid items-center gap-10 lg:grid-cols-[1fr_440px] lg:gap-16">
                        <SectionHeading
                            label={label}
                            titleBefore={titleBefore}
                            titleEm={titleEm}
                            description={description}
                        />
                        <FeaturedEditorialCard editorial={ordered[0]} />
                    </div>
                </div>
            </section>
        );
    }

    // ── Os dois editoriais: título acima, cards lado a lado (empilha no mobile) ──
    return (
        <section id="editoriais" className="relative overflow-hidden border-t border-border bg-primary-soft/40 py-20 md:py-24">
            <SectionBackdrop />
            <div className="relative mx-auto max-w-7xl px-6">
                <SectionHeading
                    label={label}
                    titleBefore={titleBefore}
                    titleEm={titleEm}
                    description="Dois editoriais abertos. Escolha o ritmo conforme você chega."
                />
                <div className="mt-12 grid gap-4 md:grid-cols-2">
                    {ordered.map(editorial => (
                        <CompactEditorialCard key={editorial.slug} editorial={editorial} />
                    ))}
                </div>
            </div>
        </section>
    );
}
