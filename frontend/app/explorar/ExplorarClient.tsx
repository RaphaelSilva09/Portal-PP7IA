"use client";

import { useBiblioteca } from "@/presentation/hooks/useBiblioteca";
import { useEspecialSemana } from "@/presentation/hooks/useEspecialSemana";
import { useEstudar } from "@/presentation/hooks/useEstudar";
import { useMiniLivros } from "@/presentation/hooks/useMiniLivros";
import { useNewsletters } from "@/presentation/hooks/useNewsletters";
import { useRadarOportunidades } from "@/presentation/hooks/useRadarOportunidades";
import {
    BlockBiblioteca,
    BlockEstudar,
    BlockLivro,
    BlockNewsletter,
    BlockRadar,
    BlockReportagem,
} from "./blocks";
import { portalContentClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { FileText, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import { useExplorarConfig } from "@/presentation/hooks/useExplorarConfig";

const BLOCKS = [
    { id: "newsletter",  label: "Newsletter",          num: "01", codePrefix: "PPNEWS"  },
    { id: "reportagem",  label: "Reportagem da Semana", num: "02", codePrefix: "PPREP"  },
    { id: "radar",       label: "Radar",               num: "03", codePrefix: "PPRADAR" },
    { id: "livro",       label: "Enquanto é Tempo",    num: "04", codePrefix: "PPLIVRO" },
    { id: "biblioteca",  label: "Biblioteca",          num: "05", codePrefix: "PPBIB"   },
    { id: "estudar",     label: "Estudar",             num: "06", codePrefix: "PPEST"   },
    { id: "ensinar",     label: "Ensinar",             num: "07", codePrefix: "PPENS"   },
] as const;

type BlockId = typeof BLOCKS[number]["id"];

const BLOCK_COLOR: Record<BlockId, string> = {
    newsletter: "var(--block-newsletter)",
    reportagem: "var(--block-reportagem)",
    radar:      "var(--block-radar)",
    livro:      "var(--block-livro)",
    biblioteca: "var(--block-biblioteca)",
    estudar:    "var(--block-estudar)",
    ensinar:    "var(--block-ensinar)",
};

const BLOCK_SOFT: Record<BlockId, string> = {
    newsletter: "var(--block-newsletter-soft)",
    reportagem: "var(--block-reportagem-soft)",
    radar:      "var(--block-radar-soft)",
    livro:      "var(--block-livro-soft)",
    biblioteca: "var(--block-biblioteca-soft)",
    estudar:    "var(--block-estudar-soft)",
    ensinar:    "var(--block-ensinar-soft)",
};

const BLOCK_ON: Record<BlockId, string> = {
    newsletter: "var(--block-newsletter-on)",
    reportagem: "var(--block-reportagem-on)",
    radar:      "var(--block-radar-on)",
    livro:      "var(--block-livro-on)",
    biblioteca: "var(--block-biblioteca-on)",
    estudar:    "var(--block-estudar-on)",
    ensinar:    "var(--block-ensinar-on)",
};

interface CardItem {
    key: string;
    blockId: BlockId;
    block: typeof BLOCKS[number];
    code: string;
    title: string;
    htmlPath: string | null;
    pdfPath: string | null;
    htmlAvailable: boolean;
    pdfAvailable: boolean;
    formattedDate: string;
    createdAt: Date;
}

interface ContentLike {
    id: number;
    title: string;
    htmlPath: string | null;
    pdfPath: string | null;
    htmlAvailable: boolean;
    pdfAvailable: boolean;
    formattedDate: string;
    formattedNumber: string;
    createdAt: Date;
}

interface Props {
    initialBlock: string | null;
}

export default function ExplorarClient({ initialBlock }: Props) {
    const router = useRouter();
    const explorarConfig = useExplorarConfig();
    const validInitial = (BLOCKS.find(b => b.id === initialBlock)?.id ?? null) as BlockId | null;
    const [activeBlock, setActiveBlock] = useState<BlockId | null>(validInitial);
    const tabsRef = useRef<HTMLDivElement>(null);

    const newsletters = useNewsletters();
    const especial = useEspecialSemana();
    const radar = useRadarOportunidades();
    const miniLivros = useMiniLivros();
    const biblioteca = useBiblioteca();
    const estudar = useEstudar();

    const isLoading =
        newsletters.isLoading || especial.isLoading || radar.isLoading ||
        miniLivros.isLoading || biblioteca.isLoading || estudar.isLoading;

    const handleBlockChange = useCallback((blockId: BlockId | null) => {
        setActiveBlock(blockId);
        const url = blockId ? `/explorar?b=${blockId}` : "/explorar";
        router.replace(url, { scroll: false });
    }, [router]);

    const allCards = useMemo<CardItem[]>(() => {
        const cards: CardItem[] = [];

        function push(items: Array<ContentLike | null | undefined>, blockId: BlockId) {
            const block = BLOCKS.find(b => b.id === blockId)!;
            for (const item of items) {
                if (!item) continue;
                cards.push({
                    key: `${blockId}-${item.id}`,
                    blockId,
                    block,
                    code: `${block.codePrefix}-${item.formattedNumber}`,
                    title: item.title,
                    htmlPath: item.htmlPath,
                    pdfPath: item.pdfPath,
                    htmlAvailable: item.htmlAvailable,
                    pdfAvailable: item.pdfAvailable,
                    formattedDate: item.formattedDate,
                    createdAt: item.createdAt,
                });
            }
        }

        push([newsletters.latest, ...newsletters.older], "newsletter");
        push([especial.latest, ...especial.older], "reportagem");
        push([radar.latest, ...radar.older], "radar");
        push(
            miniLivros.all.length > 0
                ? miniLivros.all
                : [miniLivros.latest, ...miniLivros.older],
            "livro",
        );
        push([biblioteca.latest, ...biblioteca.older], "biblioteca");
        push([estudar.latest, ...estudar.older], "estudar");

        return cards.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [newsletters, especial, radar, miniLivros, biblioteca, estudar]);

    const blockCounts = useMemo(() => {
        const counts: Partial<Record<BlockId, number>> = {};
        for (const c of allCards) {
            counts[c.blockId] = (counts[c.blockId] ?? 0) + 1;
        }
        return counts;
    }, [allCards]);

    const filteredCards = useMemo(
        () => activeBlock ? allCards.filter(c => c.blockId === activeBlock) : allCards,
        [allCards, activeBlock],
    );

    return (
        <>
            {/* ─── Hero ──────────────────────────────────────────────── */}
            <section className="relative overflow-hidden border-b border-border/60 bg-background py-16 md:py-12">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10"
                    style={{
                        background:
                            "radial-gradient(55% 45% at 85% 0%, var(--block-newsletter-soft) 0%, transparent 55%)," +
                            "radial-gradient(40% 35% at 0% 100%, var(--block-estudar-soft) 0%, transparent 55%)," +
                            "radial-gradient(30% 30% at 50% 60%, var(--block-radar-soft) 0%, transparent 55%)",
                    }}
                />

                <div className={portalContentClass}>
                    <div className="max-w-3xl">
                        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                            {explorarConfig.hero.eyebrow}
                        </p>
                        <h1 className="text-4xl leading-[1.1] tracking-[-0.02em] text-ink sm:text-5xl md:text-6xl" style={{ fontFamily: '"Instrument Serif", serif' }}>
                            {explorarConfig.hero.titleBefore}{" "}
                            <em className="italic text-primary">{explorarConfig.hero.titleEm}</em>.
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                            {explorarConfig.hero.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── Sticky Tab Bar ────────────────────────────────────── */}
            <div className="sticky top-16 z-30 border-b border-border/60 bg-background/95 backdrop-blur-md md:top-20">
                <div className={portalContentClass}>
                    <div
                        ref={tabsRef}
                        className="flex items-center gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        role="tablist"
                        aria-label="Filtrar por bloco"
                    >
                        {/* Recentes */}
                        <button
                            role="tab"
                            aria-selected={activeBlock === null}
                            onClick={() => handleBlockChange(null)}
                            className={cn(
                                "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                                activeBlock === null
                                    ? "bg-ink text-background"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                        >
                            Recentes
                            {!isLoading && (
                                <span className={cn(
                                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                                    activeBlock === null
                                        ? "bg-background/20 text-background"
                                        : "bg-accent text-muted-foreground",
                                )}>
                                    {allCards.length}
                                </span>
                            )}
                        </button>

                        <div className="mx-2 h-4 w-px shrink-0 bg-border" aria-hidden="true" />

                        {BLOCKS.map(block => {
                            const count = blockCounts[block.id as BlockId] ?? 0;
                            const isActive = activeBlock === block.id;
                            const color = BLOCK_COLOR[block.id as BlockId];
                            return (
                                <button
                                    key={block.id}
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => handleBlockChange(block.id as BlockId)}
                                    className={cn(
                                        "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                                        isActive
                                            ? "text-background"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                    )}
                                    style={isActive ? { backgroundColor: color } : undefined}
                                >
                                    <span className="mr-1 font-serif text-xs tracking-wide opacity-80">{block.num}</span>
                                    {block.label}
                                    {!isLoading && count > 0 && (
                                        <span className={cn(
                                            "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                                            isActive
                                                ? "bg-background/25 text-background"
                                                : "bg-accent text-muted-foreground",
                                        )}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ─── Content ───────────────────────────────────────────── */}
            {activeBlock === null ? (
                <section className="py-12" aria-label="Conteúdo recente">
                    <div className={portalContentClass}>
                        {isLoading ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {BLOCK_SKELETON_COLORS.map((color, i) => (
                                    <SkExplorarCard key={i} color={color} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredCards.map(card => (
                                    <ExplorarCard key={card.key} card={card} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            ) : activeBlock === "newsletter" ? (
                <BlockNewsletter />
            ) : activeBlock === "reportagem" ? (
                <BlockReportagem />
            ) : activeBlock === "radar" ? (
                <BlockRadar />
            ) : activeBlock === "livro" ? (
                <BlockLivro />
            ) : activeBlock === "biblioteca" ? (
                <BlockBiblioteca />
            ) : activeBlock === "estudar" ? (
                <BlockEstudar />
            ) : (
                <section className="py-24">
                    <div className={portalContentClass}>
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
                            <p className="font-serif text-2xl text-ink">Em construção.</p>
                            <p className="text-sm text-muted-foreground">Este bloco ainda está sendo preparado.</p>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

// ── Skeleton for "Recentes" grid ─────────────────────────────────────────────

const BLOCK_SKELETON_COLORS = [
    "var(--block-newsletter)",
    "var(--block-reportagem)",
    "var(--block-radar)",
    "var(--block-livro)",
    "var(--block-biblioteca)",
    "var(--block-estudar)",
    "var(--block-newsletter)",
    "var(--block-livro)",
    "var(--block-radar)",
];

function SkExplorarCard({ color }: { color: string }) {
    return (
        <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-background">
            <div className="h-1 w-full shrink-0" style={{ backgroundColor: color } as CSSProperties} aria-hidden="true" />
            <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-2">
                    <div className="h-5 w-32 animate-pulse rounded-full bg-accent" />
                    <div className="h-4 w-16 animate-pulse rounded-lg bg-accent" />
                </div>
                <div className="flex-1 space-y-2">
                    <div className="h-6 w-full animate-pulse rounded-lg bg-accent" />
                    <div className="h-6 w-5/6 animate-pulse rounded-lg bg-accent" />
                    <div className="h-6 w-3/5 animate-pulse rounded-lg bg-accent" />
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                    <div className="h-4 w-20 animate-pulse rounded-lg bg-accent" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-accent" />
                </div>
            </div>
        </article>
    );
}

function ExplorarCard({ card }: { card: CardItem }) {
    const color = BLOCK_COLOR[card.blockId];
    const colorSoft = BLOCK_SOFT[card.blockId];
    const colorOn = BLOCK_ON[card.blockId];
    const primaryHref = card.htmlPath ?? card.pdfPath;

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all hover:border-foreground/20 hover:shadow-[var(--shadow-card)]">
            {/* Colored top bar */}
            <div className="h-1 w-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />

            <div className="flex flex-1 flex-col gap-3 p-5">
                {/* Block badge + code */}
                <div className="flex items-center justify-between gap-2">
                    <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ backgroundColor: color, color: colorOn }}
                    >
                        <span className="font-serif opacity-80">{card.block.num}</span>
                        {card.block.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{card.code}</span>
                </div>

                {/* Title */}
                {primaryHref ? (
                    <Link href={primaryHref} className="flex-1">
                        <h3 className="line-clamp-3 font-serif text-lg leading-[1.45] tracking-[0.01em] text-ink transition-colors group-hover:text-primary">
                            {card.title}
                        </h3>
                    </Link>
                ) : (
                    <h3 className="flex-1 line-clamp-3 font-serif text-lg leading-[1.45] tracking-[0.01em] text-ink/60">
                        {card.title}
                    </h3>
                )}

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                    <span className="text-xs text-muted-foreground">{card.formattedDate}</span>
                    <div className="flex items-center gap-1.5">
                        {card.htmlAvailable && (
                            <Link
                                href={card.htmlPath!}
                                className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                            >
                                <Globe className="size-2.5" aria-hidden="true" />
                                Online
                            </Link>
                        )}
                        {card.pdfAvailable && (
                            <a
                                href={card.pdfPath!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                            >
                                <FileText className="size-2.5" aria-hidden="true" />
                                PDF
                            </a>
                        )}
                        {!card.htmlAvailable && !card.pdfAvailable && (
                            <span className="rounded-full border border-dashed border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground/50">
                                Em breve
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
