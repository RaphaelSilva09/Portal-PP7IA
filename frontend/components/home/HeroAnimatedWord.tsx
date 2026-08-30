"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * `-on-surface`, não a cor de acento crua (`--block-*`): a palavra é
 * renderizada em texto grande diretamente sobre --bg-primary. No tema claro,
 * radar/livro/reportagem em sua tonalidade de acento decorativo ficam abaixo
 * de 3:1 (axe color-contrast, achado C01 — "clareza"). Ver contrato de cores
 * em app/globals.css e frontend/__tests__/design/blockColorContrast.test.ts.
 */
const WORDS = [
    { text: "ritmo", color: "var(--block-newsletter-on-surface)" },
    { text: "clareza", color: "var(--block-radar-on-surface)" },
    { text: "foco", color: "var(--block-estudar-on-surface)" },
    { text: "visão", color: "var(--block-livro-on-surface)" },
    { text: "decisão", color: "var(--block-reportagem-on-surface)" },
];

export default function HeroAnimatedWord() {
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);
    const [targetWidth, setTargetWidth] = useState<number | undefined>(undefined);
    const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);
    const indexRef = useRef(0);
    const widthsRef = useRef<number[]>([]);
    const rulerRef = useRef<HTMLSpanElement>(null);

    const measure = useCallback(() => {
        const ruler = rulerRef.current;
        if (!ruler) return;
        const measured = Array.from(ruler.children).map(
            (el) => (el as HTMLElement).getBoundingClientRect().width,
        );
        widthsRef.current = measured;
        setTargetWidth(measured[indexRef.current]);
        setMaxWidth(Math.max(...measured));
    }, []);

    useEffect(() => {
        measure();
        document.fonts.ready.then(measure);
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [measure]);

    useEffect(() => {
        // prefers-reduced-motion: mantém a primeira palavra fixa, sem
        // rotação/fade — evita período de leitura insuficiente para quem
        // pediu menos movimento (PDF PageSpeed 3 animações não compostas).
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let swapId: ReturnType<typeof setTimeout> | null = null;
        const id = setInterval(() => {
            const next = (indexRef.current + 1) % WORDS.length;
            // Width transition starts immediately as word fades out
            setTargetWidth(widthsRef.current[next]);
            setVisible(false);
            swapId = setTimeout(() => {
                indexRef.current = next;
                setIndex(next);
                setVisible(true);
                swapId = null;
            }, 350);
        }, 2800);
        return () => {
            clearInterval(id);
            if (swapId !== null) clearTimeout(swapId);
        };
    }, []);

    const word = WORDS[index];

    return (
        <>
            {/*
             * Ruler off-screen: renders all words at the exact h1 font size
             * so we can measure their real pixel widths.
             */}
            <span
                ref={rulerRef}
                aria-hidden="true"
                className="pointer-events-none select-none italic tracking-[-0.025em]"
                style={{
                    position: "fixed",
                    top: -9999,
                    left: -9999,
                    fontFamily: '"Instrument Serif", serif',
                    fontSize: "clamp(4.7rem, 9vw, 7.8rem)",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                }}
            >
                {WORDS.map((w) => (
                    <span key={w.text}>{w.text}</span>
                ))}
            </span>

            <span
                className="relative inline-block"
                style={{
                    width: targetWidth ? `${targetWidth}px` : undefined,
                    verticalAlign: "baseline",
                    transition: "width 550ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <em
                    style={{
                        display: "block",
                        whiteSpace: "nowrap",
                        fontStyle: "italic",
                        color: word.color,
                        opacity: visible ? 1 : 0,
                        filter: visible ? "blur(0px)" : "blur(6px)",
                        transition:
                            "opacity 350ms ease, filter 350ms ease, color 550ms ease",
                    }}
                >
                    {word.text}
                </em>

                {/*
                 * Underline: the bar is laid out once at the widest word's width
                 * (never animated) and the per-word length is drawn with a
                 * `transform: scaleX()` instead of an animated `width`. Animating
                 * `width` forces layout + paint on every frame (a non-composited
                 * animation flagged by Lighthouse); `transform` runs on the
                 * compositor thread only. `transform-origin: left` keeps the bar
                 * anchored to the start of the word, matching the old visual.
                 */}
                <span
                    className="absolute rounded-full"
                    style={{
                        bottom: "-4px",
                        left: 0,
                        width: maxWidth ? `${maxWidth}px` : "100%",
                        height: "6px",
                        backgroundColor: word.color,
                        opacity: 0.3,
                        transformOrigin: "left",
                        transform: `scaleX(${maxWidth && targetWidth ? targetWidth / maxWidth : 1})`,
                        transition:
                            "transform 550ms cubic-bezier(0.4, 0, 0.2, 1), background-color 550ms ease",
                    }}
                />
            </span>
        </>
    );
}
