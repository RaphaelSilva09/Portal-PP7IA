"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WORDS = [
    { text: "ritmo", color: "var(--block-newsletter)" },
    { text: "clareza", color: "var(--block-radar)" },
    { text: "foco", color: "var(--block-estudar)" },
    { text: "visão", color: "var(--block-livro)" },
    { text: "decisão", color: "var(--block-reportagem)" },
];

export default function HeroAnimatedWord() {
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);
    const [targetWidth, setTargetWidth] = useState<number | undefined>(undefined);
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
    }, []);

    useEffect(() => {
        measure();
        document.fonts.ready.then(measure);
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [measure]);

    useEffect(() => {
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
                className="pointer-events-none select-none font-serif italic tracking-[-0.025em]"
                style={{
                    position: "fixed",
                    top: -9999,
                    left: -9999,
                    fontSize: "clamp(3.5rem, 11vw, 11rem)",
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
                 * Underline: width is animated directly (explicit px value)
                 * so the browser transitions it as a CSS property — not as a
                 * layout consequence of the parent's width, which is unreliable.
                 * Both transitions start at the same moment (word fade-out).
                 */}
                <span
                    className="absolute rounded-full"
                    style={{
                        bottom: "-4px",
                        left: 0,
                        width: targetWidth ? `${targetWidth}px` : "100%",
                        height: "6px",
                        backgroundColor: word.color,
                        opacity: 0.3,
                        transition:
                            "width 550ms cubic-bezier(0.4, 0, 0.2, 1), background-color 550ms ease",
                    }}
                />
            </span>
        </>
    );
}
