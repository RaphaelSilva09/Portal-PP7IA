"use client";

import { useEffect, useState } from "react";
import { AlignJustify, Bold, RotateCcw, Type } from "lucide-react";
import {
    DEFAULT_READING_PREFS,
    FONT_SCALE_STEPS,
    LINE_HEIGHT_STEPS,
    loadReadingPrefs,
    saveReadingPrefs,
    type ReadingPrefs,
} from "@/lib/readingPrefs";

const LINE_HEIGHT_LABELS: Record<string, string> = {
    null: "padrão",
    "1.7": "confortável",
    "1.9": "ampla",
};

function isDefault(prefs: ReadingPrefs): boolean {
    return (
        prefs.fontScale === DEFAULT_READING_PREFS.fontScale &&
        prefs.weight === DEFAULT_READING_PREFS.weight &&
        prefs.lineHeight === DEFAULT_READING_PREFS.lineHeight
    );
}

const buttonClass =
    "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full border border-border bg-background/80 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

interface ReadingPrefsControlProps {
    /** Sem wrapper sticky próprio — para compor uma barra externa (ex.: junto ao link de voltar). */
    inline?: boolean;
}

export default function ReadingPrefsControl({ inline = false }: ReadingPrefsControlProps) {
    const [prefs, setPrefs] = useState<ReadingPrefs>(DEFAULT_READING_PREFS);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setPrefs(loadReadingPrefs());
        setMounted(true);
    }, []);

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

    const wrapperClass = inline
        ? "flex flex-wrap items-center justify-end gap-1.5"
        : "sticky top-16 z-20 flex flex-wrap items-center justify-end gap-1.5 border-b border-border/60 bg-background/90 px-4 py-2 backdrop-blur-md md:top-20";

    return (
        <div
            className={wrapperClass}
            role="toolbar"
            aria-label="Ajustes de leitura"
        >
            <span className="mr-1 hidden items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 sm:inline-flex">
                <Type className="size-3" aria-hidden="true" />
                Leitura
            </span>

            <button
                type="button"
                className={buttonClass}
                onClick={() => stepFont(-1)}
                disabled={scaleIndex <= 0}
                aria-label="Diminuir tamanho da fonte"
            >
                A−
            </button>
            <button
                type="button"
                className={buttonClass}
                onClick={() => stepFont(1)}
                disabled={scaleIndex >= FONT_SCALE_STEPS.length - 1}
                aria-label="Aumentar tamanho da fonte"
            >
                A+
            </button>

            <button
                type="button"
                className={buttonClass}
                onClick={() => update({ ...prefs, weight: prefs.weight === "medium" ? "regular" : "medium" })}
                aria-pressed={prefs.weight === "medium"}
                aria-label={prefs.weight === "medium" ? "Usar peso regular" : "Usar peso médio"}
            >
                <Bold className="size-3" aria-hidden="true" />
                {prefs.weight === "medium" ? "Médio" : "Regular"}
            </button>

            <button
                type="button"
                className={buttonClass}
                onClick={cycleLineHeight}
                aria-label="Alternar espaçamento entre linhas"
            >
                <AlignJustify className="size-3" aria-hidden="true" />
                {LINE_HEIGHT_LABELS[String(prefs.lineHeight)]}
            </button>

            {!isDefault(prefs) && (
                <button
                    type="button"
                    className={buttonClass}
                    onClick={() => update({ ...DEFAULT_READING_PREFS })}
                    aria-label="Restaurar tipografia padrão"
                >
                    <RotateCcw className="size-3" aria-hidden="true" />
                </button>
            )}
        </div>
    );
}
