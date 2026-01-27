"use client";

import React from "react";
import QuemSomosHero from "./QuemSomosHero";
import TeamSection from "./TeamSection";
import PartnersSection from "./PartnersSection";

export default function QuemSomosContent() {
    return (
        <section id="quemsomos" className="py-12 px-4 sm:px-6 lg:px-8" style={{ scrollMarginTop: "100px" }}>
            <div className="max-w-7xl mx-auto">
                {/* Hero / Intro */}
                <QuemSomosHero />

                {/* Equipe */}
                <TeamSection />

                {/* Linha separadora com efeito de luz */}
                <div className="relative h-px my-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-700" />
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
                </div>

                {/* As 7 IAs Parceiras */}
                <PartnersSection />
            </div>
        </section>
    );
}
