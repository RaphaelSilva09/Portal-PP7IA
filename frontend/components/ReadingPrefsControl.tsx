"use client";

import { useEffect, useState } from "react";
import { AlignJustify, Bold, RotateCcw, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DEFAULT_READING_PREFS,
    FONT_SCALE_STEPS,
    LINE_HEIGHT_STEPS,
    loadReadingPrefs,
    saveReadingPrefs,
    WEIGHT_STEPS,
    type ReadingPrefs,
} from "@/lib/readingPrefs";

const LINE_HEIGHT_LABELS: Record<string, string> = {
    null: "Padrão",
    "1.7": "Confortável",
    "1.9": "Ampla",
};

const WEIGHT_LABELS: Record<string, string> = {
    regular: "Regular",
    medium: "Médio",
    bold: "Negrito",
};

function isDefault(prefs: ReadingPrefs): boolean {
    return (
        prefs.fontScale === DEFAULT_READING_PREFS.fontScale &&
        prefs.weight === DEFAULT_READING_PREFS.weight &&
        prefs.lineHeight === DEFAULT_READING_PREFS.lineHeight
    );
}

const menuItemClass =
    "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent/50 disabled:pointer-events-none disabled:opacity-40";

const fontBadgeClass =
    "flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold";

export default function ReadingPrefsControl() {
    const [prefs, setPrefs] = useState<ReadingPrefs>(DEFAULT_READING_PREFS);
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setPrefs(loadReadingPrefs());
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen]);

    if (!mounted) return null;

    const update = (next: ReadingPrefs) => {
        setPrefs(next);
        saveReadingPrefs(next);
    };

    const scaleIndex = FONT_SCALE_STEPS.indexOf(prefs.fontScale);

    const stepFont = (delta: number) => {
        const nextIndex = Math.min(Math.max(scaleIndex + delta, 0), FONT_SCALE_STEPS.length - 1);
        update({ ...prefs, fontScale: FONT_SCALE_STEPS[nextIndex] });
    };

    const cycleLineHeight = () => {
        const currentIndex = LINE_HEIGHT_STEPS.indexOf(prefs.lineHeight);
        const next = LINE_HEIGHT_STEPS[(currentIndex + 1) % LINE_HEIGHT_STEPS.length];
        update({ ...prefs, lineHeight: next });
    };

    const cycleWeight = () => {
        const currentIndex = WEIGHT_STEPS.indexOf(prefs.weight);
        const next = WEIGHT_STEPS[(currentIndex + 1) % WEIGHT_STEPS.length];
        update({ ...prefs, weight: next });
    };

    return (
        <>
            {/* O conteúdo do artigo ocupa a página quase toda dentro de um
                <iframe> same-origin — cliques ali nunca borbulham até o
                `document` deste frame (documento separado), então um listener
                de pointerdown no document não detecta "clique fora" na
                prática. Este scrim cobre a viewport inteira só enquanto o
                menu está aberto e fecha no clique, sem depender de bubbling
                cross-frame. Fica FORA do wrapper z-40 do botão/menu (irmão
                independente, não filho) para que seu próprio z-30 seja
                comparado direto com o resto da página — z-30 dentro de um
                wrapper z-40 só ordenaria contra os próprios irmãos daquele
                wrapper, não contra o iframe/header/barra de contexto. */}
            {isOpen && (
                <div
                    aria-hidden="true"
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-30"
                />
            )}
            <div className="fixed bottom-6 right-6 z-40">
                {isOpen && (
                    <div
                        role="menu"
                        aria-label="Ajustes de leitura"
                        className="absolute bottom-full right-0 mb-3 w-72 overflow-hidden rounded-2xl border border-border bg-background py-2 shadow-[var(--shadow-elevated)]"
                    >
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => stepFont(-1)}
                            disabled={scaleIndex <= 0}
                            className={menuItemClass}
                        >
                            <span className="flex items-center gap-3">
                                <span aria-hidden="true" className={fontBadgeClass}>A−</span>
                                Diminuir fonte
                            </span>
                        </button>
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => stepFont(1)}
                            disabled={scaleIndex >= FONT_SCALE_STEPS.length - 1}
                            className={menuItemClass}
                        >
                            <span className="flex items-center gap-3">
                                <span aria-hidden="true" className={fontBadgeClass}>A+</span>
                                Aumentar fonte
                            </span>
                        </button>
                        <button
                            type="button"
                            role="menuitem"
                            onClick={cycleWeight}
                            className={menuItemClass}
                        >
                            <span className="flex items-center gap-3">
                                <Bold className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                Peso da fonte
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {WEIGHT_LABELS[prefs.weight]}
                            </span>
                        </button>
                        <button
                            type="button"
                            role="menuitem"
                            onClick={cycleLineHeight}
                            className={menuItemClass}
                        >
                            <span className="flex items-center gap-3">
                                <AlignJustify className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                Espaçamento entre linhas
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {LINE_HEIGHT_LABELS[String(prefs.lineHeight)]}
                            </span>
                        </button>
                        {!isDefault(prefs) && (
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => update({ ...DEFAULT_READING_PREFS })}
                                className={menuItemClass}
                            >
                                <span className="flex items-center gap-3">
                                    <RotateCcw className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                    Restaurar padrão
                                </span>
                            </button>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setIsOpen(v => !v)}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    aria-label="Ajustes de leitura"
                    className={cn(
                        "flex size-12 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[var(--shadow-elevated)] transition-colors hover:border-foreground/30",
                        isOpen && "border-foreground/40 text-primary",
                    )}
                >
                    <Type className="size-5" aria-hidden="true" />
                </button>
            </div>
        </>
    );
}
