"use client";

import { useRef } from "react";
import { useAuthorScroll } from "@/hooks/useAuthorScroll";
import AuthorProfile from "./AuthorProfile";
import AuthorSections, { authorSections } from "./AuthorSections";
import AuthorTimeline from "./AuthorTimeline";

export default function Author() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLElement | null)[]>([]);

    const { scrollProgress, activeSectionIndex, sectionPositions, sectionOpacities } = useAuthorScroll(
        containerRef,
        sectionRefs,
        authorSections.length
    );

    return (
        <section
            id="autor"
            ref={containerRef}
            className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20"
            style={{ isolation: "isolate" }}
        >
            {/* Timeline - Absolute positioning, contained within section */}
            <AuthorTimeline
                containerRef={containerRef}
                activeSectionIndex={activeSectionIndex}
                sectionPositions={sectionPositions}
            />

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                    {/* Sticky Author Profile - stays within section boundaries */}
                    <div className="lg:sticky lg:top-[30vh] lg:self-start">
                        <AuthorProfile />
                    </div>

                    {/* Scrollable Sections */}
                    <AuthorSections
                        sections={authorSections}
                        activeSectionIndex={activeSectionIndex}
                        sectionRefs={sectionRefs}
                        sectionOpacities={sectionOpacities}
                    />
                </div>
            </div>
        </section>
    );
}
