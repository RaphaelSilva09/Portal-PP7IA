"use client";

/**
 * Cards de conteúdo compartilhados entre /explorar e /salvos — mesma aparência
 * em qualquer lugar que liste conteúdo do portal (blocos, mixados ou não).
 */

import SaveForLaterButton from "@/components/SaveForLaterButton";
import UpdatedBadge from "@/components/UpdatedBadge";
import type { ContentType } from "@/domain/entities/ContentItem";
import { ArrowUpRight, Clock, Globe } from "lucide-react";
import Link from "next/link";

// ── Design config per block ───────────────────────────────────────────────────

export const BLOCK_CARD_CONFIG = {
    newsletter: { color: "var(--block-newsletter)", soft: "var(--block-newsletter-soft)", on: "var(--block-newsletter-on)", num: "01", label: "Newsletter",              code: "PPNEWS" },
    reportagem: { color: "var(--block-reportagem)", soft: "var(--block-reportagem-soft)", on: "var(--block-reportagem-on)", num: "02", label: "Inteligência Artificial", code: "PPIA"    },
    radar:      { color: "var(--block-radar)",      soft: "var(--block-radar-soft)",      on: "var(--block-radar-on)",      num: "03", label: "Editoriais e Artigos",    code: "PPART"  },
    livro:      { color: "var(--block-livro)",      soft: "var(--block-livro-soft)",      on: "var(--block-livro-on)",      num: "04", label: "Enquanto é Tempo",    code: "PPLIVRO" },
    biblioteca: { color: "var(--block-biblioteca)", soft: "var(--block-biblioteca-soft)", on: "var(--block-biblioteca-on)", num: "05", label: "Biblioteca",          code: "PPBIB"   },
    estudar:    { color: "var(--block-estudar)",    soft: "var(--block-estudar-soft)",    on: "var(--block-estudar-on)",    num: "06", label: "Estudar",             code: "PPEST"   },
} as const;

export type BlockCfg = typeof BLOCK_CARD_CONFIG[keyof typeof BLOCK_CARD_CONFIG];
export type BlockColors = Omit<BlockCfg, "color" | "soft" | "on"> & { color: string; soft: string; on: string; onSoft?: string };

/** Mapeia o `ContentType` (domínio/API) para o config de card do bloco correspondente. */
const CONTENT_TYPE_TO_CARD_CONFIG: Record<ContentType, BlockCfg> = {
    newsletter: BLOCK_CARD_CONFIG.newsletter,
    "mini-livro": BLOCK_CARD_CONFIG.livro,
    ebook: BLOCK_CARD_CONFIG.livro,
    biblioteca: BLOCK_CARD_CONFIG.biblioteca,
    "especial-semana": BLOCK_CARD_CONFIG.reportagem,
    radar_oportunidades: BLOCK_CARD_CONFIG.radar,
    estudar: BLOCK_CARD_CONFIG.estudar,
};

export function cardConfigForContentType(type: ContentType): BlockCfg {
    return CONTENT_TYPE_TO_CARD_CONFIG[type];
}

// ── Shared content interface ──────────────────────────────────────────────────

export interface Item {
    id: number;
    title: string;
    htmlPath: string | null;
    pdfPath: string | null;
    htmlAvailable: boolean;
    pdfAvailable: boolean;
    formattedDate: string;
    formattedNumber: string;
    readTime?: number;
    updatedAt?: Date | null;
}

/** Extrai o slug de um href "/view/{type}/{slug}" — mesmo identificador usado em saved_content. */
export function slugFromHref(href: string | null): string | null {
    if (!href) return null;
    return href.split("/").pop() || null;
}

export function ReadTimeBadge({ minutes }: { minutes?: number }) {
    if (!minutes || minutes <= 0) return null;
    return (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" aria-hidden="true" />
            {minutes} min
        </span>
    );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

export function FormatBadges({ item }: { item: Item }) {
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

export function FeaturedCard({ item, block, contentType, hideCode }: { item: Item; block: BlockCfg; contentType: ContentType; hideCode?: boolean }) {
    const href = item.htmlPath;
    const slug = slugFromHref(href);
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
                    <ReadTimeBadge minutes={item.readTime} />
                    <UpdatedBadge href={item.htmlPath} updatedAt={item.updatedAt} />
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
                            className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background transition hover:bg-primary"
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
                    {slug && <SaveForLaterButton contentType={contentType} contentId={slug} />}
                </div>
            </div>
        </article>
    );
}

export function ItemCard({ item, block, contentType, hideCode, initialSaved, onToggleSaved }: {
    item: Item;
    block: BlockCfg;
    contentType: ContentType;
    hideCode?: boolean;
    /** Quando já se sabe que o item está salvo (ex.: renderizado a partir de /salvos), pula a checagem no mount. */
    initialSaved?: boolean;
    /** Chamado após o leitor alternar o salvo neste card. */
    onToggleSaved?: (saved: boolean) => void;
}) {
    const href = item.htmlPath;
    const slug = slugFromHref(href);
    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition hover:border-foreground/20 hover:shadow-[var(--shadow-card)]">
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
                <div className="relative z-10 mt-1.5 empty:hidden">
                    <UpdatedBadge href={item.htmlPath} updatedAt={item.updatedAt} />
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
                    <span className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        {item.formattedDate}
                        <ReadTimeBadge minutes={item.readTime} />
                    </span>
                    <span className="flex items-center gap-1.5">
                        <FormatBadges item={item} />
                        {slug && (
                            <SaveForLaterButton
                                contentType={contentType}
                                contentId={slug}
                                initialSaved={initialSaved}
                                onToggle={onToggleSaved}
                            />
                        )}
                    </span>
                </div>
            </div>
        </article>
    );
}
