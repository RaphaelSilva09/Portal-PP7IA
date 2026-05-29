"use client";

import capaLivro from "@/assets/capa-livro.jpeg";
import capaParte1 from "@/assets/capa-parte-1.jpeg";
import capaParte2 from "@/assets/capa-parte-2.jpeg";
import capaParte3 from "@/assets/capa-parte-3.jpeg";
import { contrastColor } from "@/lib/colorContrast";

import { BIBLIOTECA_TEMAS } from "@/domain/entities/BibliotecaItem";
import type { Book } from "@/domain/entities/Book";
import type { Ebook } from "@/domain/entities/Ebook";
import { portalContentClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { useBiblioteca } from "@/presentation/hooks/useBiblioteca";
import { useBook } from "@/presentation/hooks/useBook";
import { useEbook } from "@/presentation/hooks/useEbook";
import { useEspecialSemana } from "@/presentation/hooks/useEspecialSemana";
import { useEstudar } from "@/presentation/hooks/useEstudar";
import { useMiniLivros } from "@/presentation/hooks/useMiniLivros";
import { useMiniLivroSections } from "@/presentation/hooks/useMiniLivroSections";
import { useMiniLivroSectionMeta } from "@/presentation/hooks/useMiniLivroSectionMeta";
import { useExplorarBlockConfig } from "@/presentation/hooks/useExplorarConfig";
import type { MiniLivroSection } from "@/domain/entities/MiniLivroSection";
import { useNewsletters } from "@/presentation/hooks/useNewsletters";
import { useRadarOportunidades } from "@/presentation/hooks/useRadarOportunidades";
import { ArrowUpRight, FileText, Globe } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

// ── Design config per block ───────────────────────────────────────────────────

const C = {
    newsletter: { color: "var(--block-newsletter)", soft: "var(--block-newsletter-soft)", on: "var(--block-newsletter-on)", num: "01", label: "Newsletter",          code: "PPNEWS"  },
    reportagem: { color: "var(--block-reportagem)", soft: "var(--block-reportagem-soft)", on: "var(--block-reportagem-on)", num: "02", label: "Reportagem da Semana", code: "PPREP"  },
    radar:      { color: "var(--block-radar)",      soft: "var(--block-radar-soft)",      on: "var(--block-radar-on)",      num: "03", label: "Radar",               code: "PPRADAR" },
    livro:      { color: "var(--block-livro)",      soft: "var(--block-livro-soft)",      on: "var(--block-livro-on)",      num: "04", label: "Enquanto é Tempo",    code: "PPLIVRO" },
    biblioteca: { color: "var(--block-biblioteca)", soft: "var(--block-biblioteca-soft)", on: "var(--block-biblioteca-on)", num: "05", label: "Biblioteca",          code: "PPBIB"   },
    estudar:    { color: "var(--block-estudar)",    soft: "var(--block-estudar-soft)",    on: "var(--block-estudar-on)",    num: "06", label: "Estudar",             code: "PPEST"   },
} as const;

type BlockCfg = typeof C[keyof typeof C];

// ── Shared content interface ──────────────────────────────────────────────────

interface Item {
    id: number;
    title: string;
    htmlPath: string | null;
    pdfPath: string | null;
    htmlAvailable: boolean;
    pdfAvailable: boolean;
    formattedDate: string;
    formattedNumber: string;
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function FormatBadges({ item }: { item: Item }) {
    if (!item.htmlAvailable) {
        return (
            <span className="rounded-full border border-dashed border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground/70">
                Em breve
            </span>
        );
    }
    return (
        <Link
            href={item.htmlPath!}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
            <Globe className="size-2.5" aria-hidden="true" />Online
        </Link>
    );
}

function FeaturedCard({ item, block, hideCode }: { item: Item; block: BlockCfg; hideCode?: boolean }) {
    const href = item.htmlPath;
    return (
        <article className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-background transition-shadow hover:shadow-[var(--shadow-card)]">
            <div className="h-1.5 w-full" style={{ backgroundColor: block.color }} aria-hidden="true" />
            <div className="p-8 md:p-12">
                <div className="relative z-10 flex flex-wrap items-center gap-3">
                    <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ backgroundColor: block.color, color: block.on }}
                    >
                        <span className="font-serif">{block.num}</span>
                        {block.label}
                    </span>
                    {!hideCode && <span className="font-mono text-[10px] text-muted-foreground">{block.code}-{item.formattedNumber}</span>}
                    <span className="text-xs text-muted-foreground">{item.formattedDate}</span>
                </div>

                {href ? (
                    <Link href={href} className="group block mt-4 after:absolute after:inset-0 after:rounded-2xl">
                        <h2 className="font-serif text-3xl leading-[1.15] tracking-[-0.01em] text-ink transition-colors group-hover:text-primary md:text-4xl line-clamp-3">
                            {item.title}
                        </h2>
                    </Link>
                ) : (
                    <h2 className="mt-4 font-serif text-3xl leading-[1.15] tracking-[-0.01em] text-ink/60 md:text-4xl line-clamp-3">
                        {item.title}
                    </h2>
                )}

                <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
                    {item.htmlAvailable ? (
                        <Link
                            href={item.htmlPath!}
                            className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background transition-all hover:bg-primary"
                        >
                            <Globe className="size-4" aria-hidden="true" />
                            Ler agora
                            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                        </Link>
                    ) : (
                        <span className="rounded-full border border-dashed border-border/60 px-4 py-2 text-sm text-muted-foreground/70">
                            Em breve
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}

function ItemCard({ item, block, hideCode }: { item: Item; block: BlockCfg; hideCode?: boolean }) {
    const href = item.htmlPath;
    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all hover:border-foreground/20 hover:shadow-[var(--shadow-card)]">
            <div className="h-0.5 w-full shrink-0" style={{ backgroundColor: block.color }} aria-hidden="true" />
            <div className="flex flex-1 flex-col p-5">
                <div className="relative z-10 flex items-center justify-between gap-2">
                    <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ backgroundColor: block.color, color: block.on }}
                    >
                        <span className="font-serif">{block.num}</span>
                        {block.label}
                    </span>
                    {!hideCode && <span className="font-mono text-[10px] text-muted-foreground">{block.code}-{item.formattedNumber}</span>}
                </div>
                {href ? (
                    <Link href={href} className="flex-1 after:absolute after:inset-0 after:rounded-2xl">
                        <h3 className="mt-2 line-clamp-3 font-serif text-lg leading-[1.45] tracking-[0.01em] text-ink transition-colors group-hover:text-primary">
                            {item.title}
                        </h3>
                    </Link>
                ) : (
                    <h3 className="mt-2 flex-1 line-clamp-3 font-serif text-lg leading-[1.45] tracking-[0.01em] text-ink/60">
                        {item.title}
                    </h3>
                )}
                <div className="relative z-10 mt-auto flex items-center justify-between border-t border-border/50 pt-3">
                    <span className="text-xs text-muted-foreground">{item.formattedDate}</span>
                    <FormatBadges item={item} />
                </div>
            </div>
        </article>
    );
}

function BlockHeader({ block, title, description }: {
    block: BlockCfg;
    title: string;
    description: string;
}) {
    return (
        <div className="mb-10">
            <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ backgroundColor: block.color, color: block.on }}
            >
                <span className="font-serif">{block.num}</span>
                {block.label}
            </span>
            <h2 className="mt-4 font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-ink md:text-5xl">
                {title}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {description}
            </p>
            <div className="mt-8 h-px bg-border" />
        </div>
    );
}

// ── Skeleton primitives ───────────────────────────────────────────────────────

function Sk({ className }: { className: string }) {
    return <div className={cn("animate-pulse rounded-lg bg-accent", className)} />;
}

function SkBlockHeader() {
    return (
        <div className="mb-10">
            <Sk className="h-6 w-28 rounded-full" />
            <div className="mt-4 space-y-2.5">
                <Sk className="h-11 w-72" />
                <Sk className="h-11 w-48" />
            </div>
            <div className="mt-3 space-y-2">
                <Sk className="h-4 w-full max-w-xl" />
                <Sk className="h-4 w-2/3 max-w-md" />
            </div>
            <div className="mt-8 h-px bg-border" />
        </div>
    );
}

function SkFeaturedCard({ block }: { block: BlockCfg }) {
    return (
        <article className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-background">
            <div className="h-1.5 w-full" style={{ backgroundColor: block.color }} aria-hidden="true" />
            <div className="p-8 md:p-12">
                <div className="flex flex-wrap items-center gap-3">
                    <Sk className="h-5 w-32 rounded-full" />
                    <Sk className="h-4 w-20" />
                    <Sk className="h-4 w-16" />
                </div>
                <div className="mt-4 space-y-3">
                    <Sk className="h-10 w-full max-w-xl" />
                    <Sk className="h-10 w-4/5 max-w-lg" />
                    <Sk className="h-10 w-1/2 max-w-sm" />
                </div>
                <div className="mt-6">
                    <Sk className="h-10 w-32 rounded-full" />
                </div>
            </div>
        </article>
    );
}

function SkItemCard({ block }: { block: BlockCfg }) {
    return (
        <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-background">
            <div className="h-0.5 w-full shrink-0" style={{ backgroundColor: block.color }} aria-hidden="true" />
            <div className="flex flex-1 flex-col p-5">
                <Sk className="h-5 w-32 rounded-full" />
                <div className="mt-2 flex-1 space-y-2">
                    <Sk className="h-6 w-full" />
                    <Sk className="h-6 w-5/6" />
                    <Sk className="h-6 w-3/5" />
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3">
                    <Sk className="h-4 w-20" />
                    <Sk className="h-5 w-16 rounded-full" />
                </div>
            </div>
        </article>
    );
}

function SimpleBlockSkeleton({ block }: { block: BlockCfg }) {
    return (
        <section className="py-12">
            <div className={portalContentClass}>
                <SkBlockHeader />
                <SkFeaturedCard block={block} />
                <div className="mb-6 flex items-center gap-4">
                    <Sk className="h-3 w-32" />
                    <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2].map(i => <SkItemCard key={i} block={block} />)}
                </div>
            </div>
        </section>
    );
}

function BlockEmpty({ message }: { message: string }) {
    return (
        <section className="py-24">
            <div className={portalContentClass}>
                <div className="flex min-h-[280px] items-center justify-center text-center">
                    <div>
                        <p className="font-serif text-2xl text-ink">Em breve.</p>
                        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Divider({ label }: { label: string }) {
    return (
        <div className="mb-6 flex items-center gap-4">
            <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {label}
            </span>
            <div className="h-px flex-1 bg-border" />
        </div>
    );
}

// ── Simple layout (Newsletter, Reportagem, Radar, Estudar) ────────────────────

function SimpleBlock({ block, title, description, latest, older, isLoading, error }: {
    block: BlockCfg;
    title: string;
    description: string;
    latest: Item | null;
    older: Item[];
    isLoading: boolean;
    error: string | null;
}) {
    if (isLoading) return <SimpleBlockSkeleton block={block} />;
    if (error || !latest) return <BlockEmpty message={error ?? "Nenhum conteúdo disponível ainda."} />;

    return (
        <section className="py-12">
            <div className={portalContentClass}>
                <BlockHeader block={block} title={title} description={description} />
                <FeaturedCard item={latest} block={block} />
                {older.length > 0 && (
                    <>
                        <Divider label="Edições anteriores" />
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {older.map(item => <ItemCard key={item.id} item={item} block={block} />)}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

export function BlockNewsletter() {
    const { latest, older, isLoading, error } = useNewsletters();
    const cfg = useExplorarBlockConfig("newsletter");
    return (
        <SimpleBlock
            block={C.newsletter}
            title={cfg.title}
            description={cfg.description}
            latest={latest} older={older} isLoading={isLoading} error={error}
        />
    );
}

export function BlockReportagem() {
    const { latest, older, isLoading, error } = useEspecialSemana();
    const cfg = useExplorarBlockConfig("reportagem");
    return (
        <SimpleBlock
            block={C.reportagem}
            title={cfg.title}
            description={cfg.description}
            latest={latest} older={older} isLoading={isLoading} error={error}
        />
    );
}

export function BlockRadar() {
    const { latest, older, isLoading, error } = useRadarOportunidades();
    const cfg = useExplorarBlockConfig("radar");
    return (
        <SimpleBlock
            block={C.radar}
            title={cfg.title}
            description={cfg.description}
            latest={latest} older={older} isLoading={isLoading} error={error}
        />
    );
}

export function BlockEstudar() {
    const { latest, older, isLoading, error } = useEstudar();
    const cfg = useExplorarBlockConfig("estudar");
    return (
        <SimpleBlock
            block={C.estudar}
            title={cfg.title}
            description={cfg.description}
            latest={latest} older={older} isLoading={isLoading} error={error}
        />
    );
}

function BibliotecaBlockSkeleton({ block }: { block: BlockCfg }) {
    return (
        <section className="py-12">
            <div className={portalContentClass}>
                <SkBlockHeader />
                <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[200px_1fr] lg:items-start lg:gap-10">
                    {/* Sidebar skeleton */}
                    <aside className="lg:sticky lg:top-36">
                        {/* Mobile pills */}
                        <div className="flex gap-2 overflow-hidden pb-1 lg:hidden">
                            {[80, 64, 96, 72].map(w => (
                                <Sk key={w} className={`h-8 w-${w === 80 ? "20" : w === 64 ? "16" : w === 96 ? "24" : "18"} shrink-0 rounded-full`} />
                            ))}
                        </div>
                        {/* Desktop nav */}
                        <div className="hidden rounded-2xl border border-border bg-card p-3 lg:block space-y-1">
                            <Sk className="mb-3 h-3 w-12 mx-3" />
                            {[100, 80, 90, 70, 85].map((w, i) => (
                                <Sk key={i} className="h-9 w-full rounded-xl" />
                            ))}
                        </div>
                    </aside>
                    {/* Content skeleton */}
                    <div>
                        <SkFeaturedCard block={block} />
                        <div className="mb-6 flex items-center gap-4">
                            <Sk className="h-3 w-32" />
                            <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {[0, 1, 2, 3, 4].map(i => <SkItemCard key={i} block={block} />)}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ── Biblioteca (sidebar layout with tema nav) ─────────────────────────────────

export function BlockBiblioteca() {
    const { latest, older, activeLatest, filteredOlder, activeTema, setActiveTema, isLoading, error } = useBiblioteca();
    const cfg = useExplorarBlockConfig("biblioteca");
    const block = C.biblioteca;

    if (isLoading) return <BibliotecaBlockSkeleton block={block} />;
    if (error || (!latest && older.length === 0)) return <BlockEmpty message={error ?? "Nenhum conteúdo disponível ainda."} />;

    const allItems = latest ? [latest, ...older] : older;
    const totalCount = allItems.length;

    const temaCounts = BIBLIOTECA_TEMAS.reduce<Record<string, number>>((acc, { slug }) => {
        acc[slug] = allItems.filter(item => item.tema === slug).length;
        return acc;
    }, {});

    return (
        <section className="py-12">
            <div className={portalContentClass}>
                <BlockHeader
                    block={block}
                    title={cfg.title}
                    description={cfg.description}
                />

                <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[200px_1fr] lg:items-start lg:gap-10">

                    {/* ── Sidebar ── */}
                    <aside className="lg:sticky lg:top-36 lg:self-start">

                        {/* Mobile: horizontal scroll pills */}
                        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
                            <button
                                onClick={() => setActiveTema(null)}
                                className={cn(
                                    "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                                    activeTema === null
                                        ? "border-transparent bg-ink text-background"
                                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                                )}
                            >
                                Todos
                                <span className={cn("ml-1.5 text-[10px]", activeTema === null ? "text-background" : "text-muted-foreground")}>
                                    {totalCount}
                                </span>
                            </button>
                            {BIBLIOTECA_TEMAS.map(({ slug, label }) => {
                                const isActive = activeTema === slug;
                                const count = temaCounts[slug] ?? 0;
                                return (
                                    <button
                                        key={slug}
                                        onClick={() => setActiveTema(slug)}
                                        className={cn(
                                            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                                            isActive
                                                ? "border-transparent text-background"
                                                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                                        )}
                                        style={isActive ? { backgroundColor: block.color } : undefined}
                                    >
                                        {label}
                                        {count > 0 && (
                                            <span className={cn("ml-1.5 text-[10px]", isActive ? "text-background" : "text-muted-foreground")}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Desktop: vertical nav */}
                        <nav className="hidden space-y-0.5 lg:block" aria-label="Filtrar por tema">
                            <p className="mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                Temas
                            </p>

                            <button
                                onClick={() => setActiveTema(null)}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                    activeTema === null
                                        ? "bg-accent text-foreground"
                                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                                )}
                            >
                                <span>Todos</span>
                                <span className="text-[11px] tabular-nums text-muted-foreground/80">{totalCount}</span>
                            </button>

                            <div className="my-2 h-px bg-border/60" />

                            {BIBLIOTECA_TEMAS.map(({ slug, label }) => {
                                const isActive = activeTema === slug;
                                const count = temaCounts[slug] ?? 0;
                                return (
                                    <button
                                        key={slug}
                                        onClick={() => setActiveTema(slug)}
                                        className={cn(
                                            "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors",
                                            isActive
                                                ? "bg-accent font-medium text-foreground"
                                                : "font-normal text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                                        )}
                                    >
                                        <span className="flex min-w-0 items-center gap-2">
                                            <span
                                                className={cn("size-1.5 shrink-0 rounded-full transition-opacity", isActive ? "opacity-100" : "opacity-0")}
                                                style={{ backgroundColor: block.color }}
                                                aria-hidden="true"
                                            />
                                            <span className="truncate">{label}</span>
                                        </span>
                                        {count > 0 && (
                                            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/80">{count}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* ── Content ── */}
                    <div>
                        {activeLatest ? (
                            <>
                                <FeaturedCard item={activeLatest} block={block} hideCode />
                                {filteredOlder.length > 0 && (
                                    <>
                                        <Divider label={activeTema ? "Outros neste tema" : "Edições anteriores"} />
                                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                            {filteredOlder.map(item => <ItemCard key={item.id} item={item} block={block} hideCode />)}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border">
                                <p className="text-sm text-muted-foreground">Nenhum item neste tema ainda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function SkMiniLivroListCard({ block }: { block: BlockCfg }) {
    return (
        <li>
            <div className="flex items-stretch gap-4 rounded-2xl border border-border bg-card p-5">
                <div
                    className="flex w-16 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: block.soft }}
                >
                    <Sk className="h-7 w-8 bg-accent/50" />
                </div>
                <div className="flex-1 space-y-2">
                    <Sk className="h-3 w-24" />
                    <Sk className="h-6 w-full" />
                    <Sk className="h-6 w-4/5" />
                    <Sk className="h-3 w-20" />
                    <Sk className="mt-1 h-7 w-20 rounded-full" />
                </div>
            </div>
        </li>
    );
}

function SkPartSection({ block }: { block: BlockCfg }) {
    return (
        <section className="scroll-mt-32 space-y-6">
            <div className="flex items-end gap-4 border-b border-border py-4">
                <Sk className="h-20 w-14" />
                <div className="flex-1 space-y-2 pb-1">
                    <Sk className="h-3 w-36" />
                    <Sk className="h-9 w-56" />
                </div>
            </div>
            <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SkMiniLivroListCard block={block} />
                <SkMiniLivroListCard block={block} />
            </ol>
        </section>
    );
}

function LivroBlockSkeleton({ block }: { block: BlockCfg }) {
    return (
        <section className="py-12">
            <div className={portalContentClass}>
                <SkBlockHeader />
                {/* Book hero card skeleton */}
                <article
                    className="mb-10 grid grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl border border-border p-8 md:grid-cols-[200px_1fr] md:p-10"
                    style={{ background: `linear-gradient(160deg, ${block.soft} 0%, var(--card) 70%)` }}
                >
                    <Sk className="mx-auto h-64 w-[160px] rounded-lg md:h-72 md:w-full" />
                    <div className="space-y-4">
                        <Sk className="h-7 w-44 rounded-full" />
                        <div className="space-y-2.5">
                            <Sk className="h-12 w-full max-w-sm" />
                            <Sk className="h-12 w-2/3 max-w-xs" />
                        </div>
                        <div className="space-y-2">
                            <Sk className="h-4 w-full max-w-md" />
                            <Sk className="h-4 w-3/4 max-w-sm" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Sk className="h-8 w-28 rounded-full" />
                            <Sk className="h-8 w-28 rounded-full" />
                            <Sk className="h-8 w-28 rounded-full" />
                        </div>
                    </div>
                </article>
                {/* Parts skeleton */}
                <div className="space-y-16">
                    {[0, 1, 2].map(i => <SkPartSection key={i} block={block} />)}
                </div>
            </div>
        </section>
    );
}

// ── Enquanto é Tempo / Mini-Livros (with parts + ebook cards) ────────────────

const LIVRO_PARTS = [
    { order: 1 as const, romanLabel: "I",   partLabel: "Parte I",   subtitle: "Liderança Híbrida",     anchorId: "parte-i",   color: "#2a7d46", soft: "#e6f4ec" },
    { order: 2 as const, romanLabel: "II",  partLabel: "Parte II",  subtitle: "A Coragem de Executar", anchorId: "parte-ii",  color: "#b82020", soft: "#f8e0e0" },
    { order: 3 as const, romanLabel: "III", partLabel: "Parte III", subtitle: "O Que Fica",            anchorId: "parte-iii", color: "#c96a1a", soft: "#fae8d8" },
];

function BookHeroCard({ book, block, sectionTitle, sectionDescription }: {
    book: Book;
    block: BlockCfg;
    sectionTitle: string;
    sectionDescription: string;
}) {
    const hasIntro = Boolean(book.introHtmlPath);
    const hasCoverPdf = Boolean(book.coverPdfPath);
    const [coverOpen, setCoverOpen] = useState(false);
    return (
        <>
        <article className="grid grid-cols-1 items-center gap-8 border-b border-border pb-8 md:grid-cols-[200px_1fr] md:gap-10">
            <button
                className="relative mx-auto w-[180px] cursor-zoom-in md:w-full"
                onClick={() => setCoverOpen(true)}
                aria-label="Ver capa ampliada"
            >
                <div
                    className="absolute inset-0 translate-x-2 translate-y-3 rounded-lg opacity-25 blur-xl"
                    style={{ backgroundColor: block.color }}
                    aria-hidden="true"
                />
                <img
                    src={capaLivro.src}
                    alt={`Capa ${book.title}`}
                    className="relative w-full rounded-lg shadow-2xl"
                    loading="lazy"
                />
            </button>
            <div>
                <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ backgroundColor: block.color, color: block.on }}
                >
                    <span className="font-serif">{block.num}</span>
                    {block.label}
                </span>
                <h2 className="mt-4 font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-ink md:text-5xl">
                    {sectionTitle}
                </h2>
                {sectionDescription && (
                    <p className="mt-3 max-w-xl text-muted-foreground">{sectionDescription}</p>
                )}
                {(hasCoverPdf || hasIntro) && (
                    <div className="mt-5 flex flex-wrap gap-3">
                        {hasCoverPdf && (
                            <a
                                href={book.coverPdfPath!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
                            >
                                <FileText className="size-3.5" aria-hidden="true" />
                                Ver capa
                            </a>
                        )}
                        {hasIntro && (
                            <Link
                                href={book.introHtmlPath!}
                                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-background"
                                style={{ backgroundColor: block.color }}
                            >
                                <ArrowUpRight className="size-3.5" aria-hidden="true" />
                                Ler introdução
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </article>

        {coverOpen && (
            <CoverModal src={capaLivro.src} alt={`Capa ${book.title}`} onClose={() => setCoverOpen(false)} />
        )}
        </>
    );
}

function CoverModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
    const [closing, setClosing] = useState(false);

    const close = () => {
        setClosing(true);
        setTimeout(onClose, 220);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{
                backgroundColor: "rgba(0,0,0,0.82)",
                animation: `${closing ? "cover-backdrop-out" : "cover-backdrop-in"} 220ms ease forwards`,
            }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Capa ampliada"
        >
            <img
                src={src}
                alt={alt}
                className="max-h-[90vh] max-w-[min(90vw,480px)] rounded-xl shadow-2xl"
                style={{ animation: "cover-img-in 280ms cubic-bezier(0.34,1.4,0.64,1) forwards" }}
                onClick={e => e.stopPropagation()}
            />
            <button
                className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                onClick={close}
                aria-label="Fechar"
            >
                ✕
            </button>
        </div>
    );
}

const PART_COVERS = [capaParte1.src, capaParte3.src, capaParte2.src];

function PartEbookCard({ ebook, block, partOrder, partColor, partSoft }: { ebook: Ebook; block: BlockCfg; partOrder: number; partColor: string; partSoft: string }) {
    const hasIntro = ebook.htmlAvailable;
    const hasCoverPdf = ebook.coverPdfAvailable;
    const coverSrc = PART_COVERS[partOrder - 1] ?? capaParte1.src;
    return (
        <div className="grid grid-cols-1 items-center gap-6 border-b border-border pb-6 md:grid-cols-[140px_1fr] md:gap-8">
            <div className="relative mx-auto w-[120px] md:w-full">
                <div
                    className="absolute inset-0 translate-x-1.5 translate-y-2 rounded-md opacity-25 blur-lg"
                    style={{ backgroundColor: partColor }}
                    aria-hidden="true"
                />
                <img
                    src={coverSrc}
                    alt={`Capa ${ebook.title}`}
                    className="relative w-full rounded-md shadow-xl"
                    loading="lazy"
                />
            </div>
            <div>
                {ebook.description && (
                    <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                        {ebook.description}
                    </p>
                )}
                <div className="mt-5 flex flex-wrap gap-3">
                    {hasCoverPdf && (
                        <a
                            href={ebook.coverPdfPath!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
                        >
                            <FileText className="size-3.5" aria-hidden="true" />
                            Ver capa
                        </a>
                    )}
                    {hasIntro && (
                        <Link
                            href={ebook.introHtmlPath!}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-background"
                            style={{ backgroundColor: partColor }}
                        >
                            <ArrowUpRight className="size-3.5" aria-hidden="true" />
                            Ler introdução
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

function MiniLivroListCard({ item, block, globalIndex }: { item: Item; block: BlockCfg; globalIndex: number }) {
    const href = item.htmlPath;
    const displayNum = String(globalIndex).padStart(2, "0");
    return (
        <li>
            <div className="group relative flex items-stretch gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
                <div
                    className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl font-serif text-2xl"
                    style={{ backgroundColor: block.color, color: block.on }}
                >
                    {displayNum}
                </div>
                <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: block.color }}>
                        Mini-Livro #{displayNum}
                    </div>
                    {href ? (
                        <Link href={href} className="after:absolute after:inset-0 after:rounded-2xl">
                            <h4 className="mt-1 font-serif text-lg leading-[1.45] tracking-[0.01em] text-ink transition-colors group-hover:text-primary">
                                {item.title}
                            </h4>
                        </Link>
                    ) : (
                        <h4 className="mt-1 font-serif text-lg leading-[1.45] tracking-[0.01em] text-ink/60">
                            {item.title}
                        </h4>
                    )}
                    <div className="mt-1 text-[11px] text-muted-foreground">{item.formattedDate}</div>
                    <div className="relative z-10 mt-3 flex flex-wrap gap-2 text-xs">
                        {item.htmlAvailable ? (
                            <Link
                                href={item.htmlPath!}
                                className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-medium text-foreground hover:bg-muted"
                            >
                                <ArrowUpRight className="size-3" aria-hidden="true" />
                                Ler agora
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-muted-foreground">
                                Em breve
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </li>
    );
}

function MiniLivroSectionCard({ section, block }: { section: MiniLivroSection; block: BlockCfg }) {
    return (
        <div className="group relative flex items-stretch gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
            <div
                className="flex w-1 shrink-0 self-stretch rounded-full"
                style={{ backgroundColor: block.color }}
                aria-hidden="true"
            />
            <div className="flex-1">
                <h4 className="font-serif text-lg leading-[1.45] tracking-[0.01em] text-ink">
                    {section.title}
                </h4>
                {section.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {section.description}
                    </p>
                )}
                {section.htmlAvailable && section.htmlPath && (
                    <div className="mt-3">
                        <Link
                            href={section.htmlPath}
                            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                        >
                            <ArrowUpRight className="size-3" aria-hidden="true" />
                            Ler agora
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function BookExtraSection({
    title,
    description,
    sections,
    block,
}: {
    title: string;
    description: string;
    sections: MiniLivroSection[];
    block: BlockCfg;
}) {
    if (sections.length === 0) return null;
    return (
        <div className="space-y-6">
            <div className="border-b border-border pb-6">
                <h2 className="mt-1 font-serif text-2xl leading-[1.15] tracking-[-0.01em] text-ink md:text-3xl">
                    {title}
                </h2>
                {description && (
                    <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {sections.map(section => (
                    <MiniLivroSectionCard key={section.id} section={section} block={block} />
                ))}
            </div>
        </div>
    );
}

export function BlockLivro() {
    const { book, isLoading: bookLoading } = useBook();
    const { all: miniLivros, isLoading: mlLoading } = useMiniLivros();
    const { all: ebooks, isLoading: ebLoading } = useEbook();
    const { introducoes, encerramentos, isLoading: sectionsLoading } = useMiniLivroSections();
    const { meta } = useMiniLivroSectionMeta();
    const cfg = useExplorarBlockConfig("livro");
    const block = C.livro;
    const [openPartCover, setOpenPartCover] = useState<{ src: string; alt: string } | null>(null);

    const isLoading = bookLoading || mlLoading || ebLoading || sectionsLoading;

    const sortedEbooks = useMemo(
        () => [...ebooks].sort((a, b) => a.order - b.order),
        [ebooks],
    );

    if (isLoading) return <LivroBlockSkeleton block={block} />;
    if (!book && miniLivros.length === 0) {
        return <BlockEmpty message="Nenhum mini-livro publicado ainda." />;
    }

    return (
        <>
        <section className="py-12">
            <div className={portalContentClass}>
                <div className="space-y-14">
                    {/* Livro principal — header unificado */}
                    {book && (
                        <BookHeroCard
                            book={book}
                            block={block}
                            sectionTitle={cfg.title}
                            sectionDescription={cfg.description}
                        />
                    )}

                    {/* Introdução — só exibe quando há conteúdo */}
                    <BookExtraSection
                        title={meta.introducao.title}
                        description={meta.introducao.description}
                        sections={introducoes}
                        block={block}
                    />

                    {/* Partes — todas visíveis com âncoras */}
                    <div className="space-y-14">
                        {LIVRO_PARTS.map((part, partIdx) => {
                            const partItems = miniLivros.filter(ml => ml.partOrder === part.order);
                            const ebook = sortedEbooks[part.order - 1] ?? null;
                            const globalOffset = LIVRO_PARTS
                                .slice(0, partIdx)
                                .reduce((sum, p) => sum + miniLivros.filter(ml => ml.partOrder === p.order).length, 0);

                            return (
                                <section key={part.order} id={part.anchorId} className="scroll-mt-32 space-y-6">
                                    {/* Part header */}
                                    <div className="grid grid-cols-1 items-center gap-6 border-b border-border pb-8 md:grid-cols-[160px_1fr] md:gap-10">
                                        <button
                                            className="relative mx-auto w-[140px] cursor-zoom-in md:mx-0 md:w-full"
                                            onClick={() => setOpenPartCover({ src: PART_COVERS[part.order - 1], alt: part.subtitle })}
                                            aria-label={`Ver capa ${part.partLabel} ampliada`}
                                        >
                                            <div
                                                className="absolute inset-0 translate-x-2 translate-y-3 rounded-lg opacity-25 blur-xl"
                                                style={{ backgroundColor: part.color }}
                                                aria-hidden="true"
                                            />
                                            <img
                                                src={PART_COVERS[part.order - 1]}
                                                alt={part.subtitle}
                                                className="relative w-full rounded-lg shadow-2xl"
                                            />
                                        </button>
                                        <div className="flex flex-col justify-center">
                                            <span
                                                className="font-serif text-7xl leading-none tracking-tight md:text-8xl"
                                                style={{ color: part.color }}
                                            >
                                                {part.romanLabel}
                                            </span>
                                            <div className="mt-3 text-[10px] uppercase tracking-[0.22em]" style={{ color: part.color }}>
                                                {part.partLabel} de III · {partItems.length} capítulo{partItems.length !== 1 ? "s" : ""}
                                            </div>
                                            <h3 className="mt-1 font-serif text-3xl leading-[1.15] tracking-[-0.01em] text-ink md:text-4xl">
                                                {part.subtitle}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* E-book compilado da parte */}
                                    {ebook && <PartEbookCard ebook={ebook} block={block} partOrder={part.order} partColor={part.color} partSoft={part.soft} />}

                                    {/* Mini-livros da parte */}
                                    {partItems.length > 0 ? (
                                        <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            {partItems.map((item, itemIdx) => (
                                                <MiniLivroListCard
                                                    key={item.id}
                                                    item={item as Item}
                                                    globalIndex={globalOffset + itemIdx + 1}
                                                    block={{ ...block, color: part.color, soft: part.soft, onSoft: contrastColor(part.soft) }}
                                                />
                                            ))}
                                        </ol>
                                    ) : (
                                        <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-border">
                                            <p className="text-sm text-muted-foreground">Nenhum mini-livro publicado nesta parte ainda.</p>
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>

                    {/* Encerramento — só exibe quando há conteúdo */}
                    <BookExtraSection
                        title={meta.encerramento.title}
                        description={meta.encerramento.description}
                        sections={encerramentos}
                        block={block}
                    />
                </div>
            </div>
        </section>
        {openPartCover && (
            <CoverModal src={openPartCover.src} alt={openPartCover.alt} onClose={() => setOpenPartCover(null)} />
        )}
        </>
    );
}
