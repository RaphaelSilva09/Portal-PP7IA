"use client";

import { ArrowRight, FileText } from "lucide-react";
import HeroTitle from "./HeroTitle";

// Lista de ferramentas do ecossistema de IA
const AI_TOOLS = ["Perplexity", "ChatGPT", "Gemini", "Claude", "Grok", "Manus", "Adapta.ai"];

export default function HeroSection() {
    return (
        <section className="relative flex items-center justify-center pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-4 sm:pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
            <div className="relative z-10 max-w-4xl mx-auto text-center px-2 sm:px-4">
                {/* Badge - Clickable to scroll to BentoGrid */}
                <a
                    href="#newsletter"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6"
                >
                    {/* Badge */}
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-green-500 text-sm font-medium">Última Edição</span>
                </a>

                {/* Main Title */}
                <div id="manifesto" className="mb-3 sm:mb-4 md:mb-5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <HeroTitle />
                </div>

                {/* Subtitle */}
                <p
                    className="text-lg sm:text-xl md:text-2xl text-brand-blue font-medium mb-3 sm:mb-4 md:mb-5 animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                >
                    Para Líderes, Inovadores e Profissionais Estratégicos
                </p>

                {/* Description */}
                <p
                    className="text-base sm:text-2xl text-text-secondary max-w-2xl mx-auto mb-6 sm:mb-7 md:mb-8 leading-relaxed animate-fade-in-up"
                    style={{ animationDelay: "0.3s" }}
                >
                    Traduzimos e simplificamos o que é complexo, com menos ruído e mais clareza.
                </p>

                {/* Document Buttons - Attention Grabbing */}
                <div
                    className="mb-6 sm:mb-7 md:mb-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up"
                    style={{ animationDelay: "0.4s" }}
                >
                    {/* Carta ao Leitor */}
                    <a
                        href="/CARTA-AO-LEITOR-COMPLETA.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative w-auto sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-brand-purple/10 border border-brand-purple/30 hover:bg-brand-purple/20 hover:border-brand-purple/50 rounded-2xl transition-all duration-300 touch-target hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                    >
                        {/* Pulse ring effect */}
                        <span className="absolute inset-0 rounded-2xl animate-pulse-ring border-2 border-brand-purple/40" />

                        <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-brand-purple/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="relative w-5 h-5 md:w-6 md:h-6 text-brand-purple" />
                        </div>
                        <div className="text-left">
                            <span className="block text-sm sm:text-base font-bold text-white">Carta ao Leitor</span>
                            <span className="block text-xs text-brand-purple/80">A nossa proposta</span>
                        </div>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand-purple group-hover:translate-x-1 transition-all" />
                    </a>

                    {/* Por que o 7? */}
                    <a
                        href="/Pp7ia-pq 7.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative w-auto sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-brand-purple/10 border border-brand-purple/30 hover:bg-brand-purple/20 hover:border-brand-purple/50 rounded-2xl transition-all duration-300 touch-target hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                    >
                        {/* Pulse ring effect */}
                        <span
                            className="absolute inset-0 rounded-2xl animate-pulse-ring border-2 border-brand-purple/40"
                            style={{ animationDelay: "0.5s" }}
                        />

                        <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-brand-purple/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="relative w-5 h-5 md:w-6 md:h-6 text-brand-purple" />
                        </div>
                        <div className="text-left">
                            <span className="block text-sm sm:text-base font-bold text-white">Por que o 7?</span>
                            <span className="block text-xs text-brand-purple/80">A filosofia por trás</span>
                        </div>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand-purple group-hover:translate-x-1 transition-all" />
                    </a>
                </div>


                {/* AI Tools Badge - Responsivo */}
                <div className="flex items-center justify-center px-2 ">
                    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-white font-medium transition-all duration-300 max-w-full">
                        {AI_TOOLS.map((tool, index) => (
                            <div key={tool} className="flex items-center gap-1.5 sm:gap-2">
                                <span className="tracking-tight text-base sm:text-1xl">{tool}</span>
                                {index < AI_TOOLS.length - 1 && (
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white/60" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
