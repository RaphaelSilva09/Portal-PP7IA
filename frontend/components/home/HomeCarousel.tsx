"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface HomeCarouselSlide {
    key: string;
    eyebrow: string;
    title: string;
    description?: string;
    href: string;
    /** Cor do bloco (aceita var CSS, ex.: var(--block-livro)) */
    color: string;
}

interface HomeCarouselProps {
    slides: HomeCarouselSlide[];
}

const AUTO_ADVANCE_MS = 3000;
const CARD_GAP_PX = 16;

/**
 * Carrossel de destaques da home (PDF 3.7.2) — CSS scroll-snap, sem dependências.
 * Loop infinito por clonagem do conjunto de slides: ao entrar na cópia, o scroll
 * é reposicionado de forma instantânea (imperceptível, os cards são idênticos).
 * Autoavança a cada 3s; pausa com hover/foco e respeita prefers-reduced-motion.
 */
export default function HomeCarousel({ slides }: HomeCarouselProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const skipNormalizeRef = useRef(false);
    const [isPaused, setIsPaused] = useState(false);
    const isPausedRef = useRef(isPaused);
    const isLooping = slides.length > 1;

    // Mantém a ref em dia sem forçar o efeito de autoavanço a depender de
    // isPaused — ver justificativa no useEffect abaixo.
    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    // Reposiciona o scroll quando entra no conjunto clonado (loop seamless).
    // Suspenso durante o wrap reverso (botão "anterior" no início), senão o
    // reposicionamento desfaria o salto para o fim da lista.
    const normalizeLoop = useCallback(() => {
        const track = trackRef.current;
        if (!track || !isLooping || skipNormalizeRef.current) return;
        const half = track.scrollWidth / 2;
        if (track.scrollLeft >= half) {
            track.scrollLeft = track.scrollLeft - half;
        }
    }, [isLooping]);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        track.addEventListener("scroll", normalizeLoop, { passive: true });
        return () => track.removeEventListener("scroll", normalizeLoop);
    }, [normalizeLoop]);

    const scrollByCard = useCallback((direction: 1 | -1) => {
        const track = trackRef.current;
        if (!track) return;
        const card = track.querySelector<HTMLElement>("[data-carousel-card]");
        const step = card ? card.offsetWidth + CARD_GAP_PX : track.clientWidth * 0.8;

        // Voltar do início: salta para o conjunto clonado antes de animar
        if (direction === -1 && isLooping && track.scrollLeft < step / 2) {
            skipNormalizeRef.current = true;
            track.scrollLeft = track.scrollLeft + track.scrollWidth / 2;
            window.setTimeout(() => { skipNormalizeRef.current = false; }, 700);
        }
        track.scrollBy({ left: direction * step, behavior: "smooth" });
    }, [isLooping]);

    // Autoavanço: intervalo único e contínuo desde a montagem — pausa com
    // hover/foco, aba oculta e prefers-reduced-motion são checados *dentro*
    // do tick (via ref), não recriando o timer. Se isPaused estivesse nas
    // dependências, cada entrada/saída do mouse (ex.: o cursor descansando
    // perto do carrossel, no topo da página) desmontava e remontava o
    // intervalo, reiniciando a contagem de 3s do zero — na prática o
    // autoavanço só completava um ciclo inteiro quando o mouse ficava
    // parado por tempo suficiente, dando a impressão de que só "começava"
    // depois de alguma interação.
    useEffect(() => {
        if (!isLooping) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const id = setInterval(() => {
            if (document.hidden || isPausedRef.current) return;
            scrollByCard(1);
        }, AUTO_ADVANCE_MS);
        return () => clearInterval(id);
    }, [isLooping, scrollByCard]);

    if (slides.length === 0) return null;

    /*
     * O rótulo (eyebrow) usa a cor do bloco como texto direto sobre o cartão
     * (superfície clara). A cor de acento decorativa (`--block-*`) não atinge
     * 4.5:1 em texto pequeno para várias das 7 cores no tema claro (axe
     * color-contrast, achados C02-C04). `-on-surface` é a variante escurecida
     * por tema com contraste garantido — ver app/globals.css.
     */
    const onSurfaceColor = (color: string) => color.replace(/\)\s*$/, "-on-surface)");

    const renderSlide = (slide: HomeCarouselSlide, clone: boolean) => (
        <Link
            key={clone ? `${slide.key}-clone` : slide.key}
            href={slide.href}
            data-carousel-card
            aria-hidden={clone || undefined}
            tabIndex={clone ? -1 : undefined}
            className="group relative flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:border-foreground/20 hover:shadow-[var(--shadow-card)] sm:w-[300px]"
        >
            <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: slide.color }}
                aria-hidden="true"
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: onSurfaceColor(slide.color) }}>
                {slide.eyebrow}
            </p>
            <h2 className="mt-2 line-clamp-2 font-serif text-lg leading-snug text-ink transition-colors group-hover:text-primary">
                {slide.title}
            </h2>
            {slide.description && (
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {slide.description}
                </p>
            )}
            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                Abrir
                <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
        </Link>
    );

    return (
        <section
            className="border-b border-border/60 bg-background py-10"
            aria-roledescription="carousel"
            aria-label="Destaques do portal"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsPaused(false);
            }}
        >
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-5 flex items-center justify-between">
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        Comece por aqui
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => scrollByCard(-1)}
                            aria-label="Destaques anteriores"
                            className="inline-flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                        >
                            <ChevronLeft className="size-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollByCard(1)}
                            aria-label="Próximos destaques"
                            className="inline-flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                        >
                            <ChevronRight className="size-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <div
                    ref={trackRef}
                    className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {slides.map(slide => renderSlide(slide, false))}
                    {isLooping && slides.map(slide => renderSlide(slide, true))}
                </div>
            </div>
        </section>
    );
}
