"use client";

import { useEffect, useState, RefObject } from "react";

interface TimelineProps {
    containerRef: RefObject<HTMLDivElement | null>;
    activeSectionIndex: number;
    sectionPositions: { top: number; bottom: number; id: string }[];
}

export default function AuthorTimeline({ containerRef, activeSectionIndex, sectionPositions }: TimelineProps) {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const calculateProgress = () => {
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const containerHeight = containerRect.height;
            const viewportHeight = window.innerHeight;

            // Calculate how much of the container has scrolled past viewport top
            const scrolled = -containerRect.top;
            const maxScroll = containerHeight - viewportHeight;

            // Progress from 0 to 1
            const progress = maxScroll > 0 ? Math.max(0, Math.min(1, scrolled / maxScroll)) : 0;
            setScrollProgress(progress);
        };

        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    calculateProgress();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        calculateProgress(); // Initial calculation

        return () => window.removeEventListener("scroll", handleScroll);
    }, [containerRef]);

    return (
        <div className="absolute left-1/2 top-0 bottom-0 w-px pointer-events-none z-10 hidden lg:block">
            <svg className="absolute top-0 left-0 w-full h-full" style={{ transform: "translateX(-50%)" }}>
                <defs>
                    {/* Gradient for progress line (bright) */}
                    <linearGradient id="timeline-progress-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
                        <stop offset="50%" stopColor="rgba(99, 102, 241, 1)" />
                        <stop offset="100%" stopColor="rgba(99, 102, 241, 0.4)" />
                    </linearGradient>
                </defs>

                {/* Base line (dim/inactive) */}
                <line
                    x1="50%"
                    y1="5%"
                    x2="50%"
                    y2="95%"
                    stroke="rgba(99, 102, 241, 0.2)"
                    strokeWidth="2"
                />

                {/* Progress line (bright) */}
                <line
                    x1="50%"
                    y1="5%"
                    x2="50%"
                    y2={`${5 + (scrollProgress * 90)}%`}
                    stroke="url(#timeline-progress-gradient)"
                    strokeWidth="2"
                    style={{
                        transition: "y2 0.1s ease-out",
                    }}
                />

                {/* Section indicators (small dots at each section position) */}
                {sectionPositions.map((section, index) => {
                    if (!containerRef.current) return null;

                    const containerRect = containerRef.current.getBoundingClientRect();
                    const containerHeight = containerRect.height;
                    
                    // Calculate Y position as percentage of container height
                    const sectionMiddle = (section.top + section.bottom) / 2;
                    const yPercent = (sectionMiddle / containerHeight) * 100;
                    
                    // Only show if within reasonable bounds
                    if (yPercent < 5 || yPercent > 95) return null;

                    const isActive = activeSectionIndex === index;
                    const isPassed = yPercent < (5 + (scrollProgress * 90));

                    return (
                        <circle
                            key={section.id}
                            cx="50%"
                            cy={`${yPercent}%`}
                            r={isActive ? "5" : "3"}
                            fill={isPassed ? "rgba(99, 102, 241, 0.9)" : "rgba(99, 102, 241, 0.3)"}
                            stroke={isActive ? "rgba(99, 102, 241, 0.5)" : "none"}
                            strokeWidth={isActive ? "6" : "0"}
                            style={{
                                transition: "all 0.3s ease-out",
                                filter: isActive ? "drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))" : "none",
                            }}
                        />
                    );
                })}
            </svg>
        </div>
    );
}
