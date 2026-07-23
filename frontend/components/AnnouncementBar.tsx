"use client";

/**
 * AnnouncementBar Component (Presentation Layer)
 *
 * Layout: relative container, altura dinâmica.
 * - Centro: mensagem + link + navegação — sempre centrados na largura total.
 * - Direita: botão ✕ fixo, verticalmente centrado via absolute.
 */

import { AnnouncementBar as AnnouncementBarEntity } from "@/domain/entities/AnnouncementBar";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "ppia7_closed_announcements";

interface AnnouncementBarProps {
    bars: AnnouncementBarEntity[];
}

export default function AnnouncementBar({ bars }: AnnouncementBarProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [closedIds, setClosedIds] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setClosedIds(JSON.parse(stored));
        } catch {
            // localStorage indisponível
        }
        setMounted(true);
    }, []);

    const touchStartX = useRef<number | null>(null);

    const visibleBars = bars.filter(b => !closedIds.includes(b.id));
    const total = visibleBars.length;
    const showNav = total > 1;

    const goNext = () => setCurrentIndex(i => (i + 1) % total);
    const goPrev = () => setCurrentIndex(i => (i - 1 + total) % total);

    if (!mounted || visibleBars.length === 0) return null;

    const bar = visibleBars[currentIndex % visibleBars.length];
    const showClose = bar.isClosable;

    const handleClose = () => {
        const newClosed = [...closedIds, bar.id];
        setClosedIds(newClosed);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newClosed));
        } catch {
            // localStorage indisponível
        }
        setCurrentIndex(i => {
            const remaining = visibleBars.filter(b => b.id !== bar.id);
            if (remaining.length === 0) return 0;
            return i % remaining.length;
        });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) >= 50) diff > 0 ? goNext() : goPrev();
        touchStartX.current = null;
    };

    return (
        <div
            role="region"
            aria-label="Avisos do portal"
            aria-live="polite"
            className="announcement-bar relative w-full flex items-center py-2 px-10"
            style={{ backgroundColor: bar.bgColor, color: bar.textColor }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Centro: mensagem + link + navegação */}
            <div
                key={bar.id}
                className="announcement-swap flex-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-medium text-center"
            >
                {showNav && (
                    <button
                        onClick={goPrev}
                        aria-label="Barra anterior"
                        className="p-1 rounded hover:opacity-70 transition-opacity flex-shrink-0"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}

                <span className="line-clamp-2 leading-snug">{bar.message}</span>

                {bar.linkUrl && (
                    <a
                        href={bar.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 underline underline-offset-2 whitespace-nowrap font-semibold hover:opacity-80 transition-opacity flex-shrink-0 ml-3"
                        style={{ color: bar.textColor }}
                    >
                        {bar.linkLabel || ""}
                        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                    </a>
                )}

                {showNav && (
                    <>
                        <span className="text-xs opacity-60 flex-shrink-0">
                            {(currentIndex % total) + 1}/{total}
                        </span>
                        <button
                            onClick={goNext}
                            aria-label="Próxima barra"
                            className="p-1 rounded hover:opacity-70 transition-opacity flex-shrink-0"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>

            {/* Direita: ✕ fixo, centralizado verticalmente */}
            {showClose && (
                <button
                    onClick={handleClose}
                    aria-label="Fechar aviso"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-70 transition-opacity"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
