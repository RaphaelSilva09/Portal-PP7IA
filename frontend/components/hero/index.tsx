"use client";

import React from "react";
import TopoSvg from "@/public/topo.svg";
import HeroTitle from "./HeroTitle";
import PdfButton from "./PdfButton";
import UpdateBadge from "../shared/UpdateBadge";

export default function HeroSection() {
    return (
        <section
            id="hero"
            className="relative flex flex-col items-center justify-center pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-4 sm:pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
        >
            {/* SVG Background with Fade Effect */}
            <div
                className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05]"
                style={{
                    maskImage:
                        "linear-gradient(to bottom, transparent 0%, black 40%, black 10%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0%, black 40%, black 50%, transparent 100%)",
                }}
            >
                <TopoSvg className="w-full h-full" preserveAspectRatio="xMidYMax slice" />
            </div>
            {/* Grid Pattern Overlay */}
            <div
                className="inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "center center",
                }}
            />
            {/* Content */}
            <div className="z-10 max-w-4xl mx-auto text-center px-2 sm:px-0 flex flex-col items-center gap-6 sm:gap-8">
                {/* Badge - Última Atualização */}
                <UpdateBadge />

                {/* Main Title Area */}
                <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
                    <div
                        id="manifesto"
                        className="flex justify-center animate-fade-in-up w-full"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <HeroTitle />
                    </div>

                    {/* Subtitle */}
                    <p
                        className="text-lg sm:text-xl md:text-2xl text-brand-blue font-medium animate-fade-in-up"
                        style={{ animationDelay: "0.2s" }}
                    >
                        Para Líderes, inovadores, profissionais e iniciantes
                    </p>

                    {/* Description */}
                    <p
                        className="text-base sm:text-2xl text-text-secondary max-w-2xl leading-relaxed animate-fade-in-up"
                        style={{ animationDelay: "0.3s" }}
                    >
                        Menos ruído, mais clareza. Conhecimento e IA acessível para todos.
                    </p>
                </div>

                {/* Document Buttons - Attention Grabbing */}
                <div
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up w-full"
                    style={{ animationDelay: "0.5s" }}
                >
                    <PdfButton
                        href="/boas-vindas.pdf"
                        title="Carta boas-vindas"
                        description="O primeiro passa da jornada"
                        delay="0s"
                    />

                    <PdfButton
                        href="/CARTA-AO-LEITOR-COMPLETA.pdf"
                        title="Carta ao Leitor"
                        description="A nossa proposta"
                        delay="0s"
                    />

                    <PdfButton
                        href="/Pp7ia-pq 7.pdf"
                        title="Por que o 7?"
                        description="A filosofia por trás"
                        delay="0.5s"
                    />
                </div>
            </div>
        </section>
    );
}
