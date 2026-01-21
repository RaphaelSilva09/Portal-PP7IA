"use client";

import Image from "next/image";
import {
    Bot,
    Brain,
    Briefcase,
    Eye,
    Lightbulb,
    Newspaper,
    Radar,
    BookOpen,
    Library,
    GraduationCap,
    Users,
    Sparkles,
    Target,
    Shield,
} from "lucide-react";
import { Claude, OpenAI, Gemini, Grok, Perplexity, Manus } from "@lobehub/icons";
import type { ReactNode } from "react";

// As 7 IAs Parceiras
const iasData: { name: string; href: string; icon: ReactNode }[] = [
    { name: "Claude", href: "https://claude.ai", icon: <Claude.Color size={48} /> },
    { name: "ChatGPT", href: "https://chatgpt.com", icon: <OpenAI size={48} /> },
    { name: "Gemini", href: "https://gemini.google.com", icon: <Gemini.Color size={48} /> },
    { name: "Grok", href: "https://grok.x.ai", icon: <Grok size={48} /> },
    { name: "Perplexity", href: "https://perplexity.ai", icon: <Perplexity.Color size={48} /> },
    { name: "Manus", href: "https://manus.im", icon: <Manus size={48} /> },
    { name: "Adapta.org", href: "https://adapta.org", icon: <Image src="/IAs-logo/adapta.png" alt="Adapta.org" width={48} height={48} className="w-12 h-12 object-contain" /> },
];

// Propósitos
const propositos = [
    { texto: "Curar conhecimento prático", icon: Target },
    { texto: "Desmistificar complexidade", icon: Brain },
    { texto: "Publicar só o que funciona", icon: Lightbulb },
    { texto: "Filtrar ruído", icon: Eye },
    { texto: "Manter humanidade no centro", icon: Users },
];

export default function QuemSomosContent() {
    return (
        <section id="quemsomos" className="py-12 px-4 sm:px-6 lg:px-8" style={{ scrollMarginTop: "100px" }}>
            <div className="max-w-7xl mx-auto">
                {/* ============================================
                HERO - O QUE É
                ============================================ */}
                <div className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-3xl min-h-40 mb-2">

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8 sm:p-12">

                        {/* Títulos e Descrição */}
                        <div className="flex flex-col items-center gap-1 pb-16 sm:pb-20 md:pb-24">
                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                                Quem Somos{" "}
                                <span className="bg-linear-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                                    Nós
                                </span>
                            </h3>
                            <p className="text-gray-400 text-base sm:text-2xl max-w-2xl mx-auto tracking-tight px-4">
                                Plataforma de curadoria que combina{" "}
                                <span className="text-brand-blue font-semibold">40+ anos de liderança executiva</span> com{" "}
                                <span className="text-brand-purple font-semibold">7 inteligências artificiais</span>
                            </p>
                            <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto tracking-tight px-4 mt-4">
                                Conteúdo organizado em 7 blocos principais, publicando só o que foi testado e funciona
                            </p>
                        </div>
                    </div>
                </div>

                {/* ============================================
                EQUIPE
                ============================================ */}
                <div className="mb-8">
                    <div className="group relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-300">
                        {/* Main container: flex-row with space-between */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            {/* Left side: Icon + Title + Description */}
                            <div className="flex flex-col items-center md:items-start gap-4 md:gap-6">
                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                                    <Briefcase className="w-8 h-8 text-purple-400" />
                                </div>

                                {/* Title + Description */}
                                <div className="text-center md:text-left">
                                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Equipe</h2>
                                    <p className="text-gray-400 text-base sm:text-lg tracking-tight">
                                        Criado por <span className="text-white font-medium">Paulo Periquito</span>, com
                                        assistência técnica de{" "}
                                        <span className="text-white font-medium">Raphael Silva</span> e{" "}
                                        <span className="text-white font-medium">Lucas Periquito Costa</span> (estudantes
                                        de Ciências/Engenharia da Computação).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Linha separadora com efeito de luz */}
                <div className="relative h-px my-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-700" />
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
                </div>

                {/* ============================================
                AS 7 IAS PARCEIRAS
                ============================================ */}
                <div className="mb-8">
                    <div className="group relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-300">
                        {/* Main container: flex-row with space-between */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            {/* Left side: Icon + Title + Description */}
                            <div className="flex flex-col items-center md:items-start gap-4 md:gap-6">
                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                                    <Bot className="w-8 h-8 text-cyan-400" />
                                </div>

                                {/* Title + Description */}
                                <div className="text-center md:text-left">
                                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">As 7 IAs parceiras</h2>
                                    <p className="text-gray-400 text-base sm:text-lg tracking-tight mb-2">
                                        A IA amplifica; o julgamento editorial é humano.
                                    </p>
                                    <a
                                        href="/Resumo-7IAS-e -plataformas-que -usamos .pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cyan-400 text-sm sm:text-base tracking-tight underline md:no-underline md:hover:underline hover:text-cyan-300 transition-colors duration-200"
                                    >
                                        Saiba mais sobre os modelos usados
                                    </a>
                                </div>
                            </div>

                            {/* Right side: 2 rows of IAs */}
                            <div className="flex flex-col items-center gap-8 p-4 pr-5">
                                {/* Row 1: 4 IAs */}
                                <div className="flex flex-row items-center gap-6">
                                    {iasData.slice(0, 4).map((ia) => (
                                        <a
                                            key={ia.name}
                                            href={ia.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/ia p-2 transition-all duration-300"
                                        >
                                            <div
                                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center group-hover/ia:scale-125 transition-transform duration-300 drop-shadow-[3px_4px_2px_rgba(255,255,255,0.25)] border-2 border-white/30"
                                            >
                                                {ia.icon}
                                            </div>
                                        </a>
                                    ))}
                                </div>

                                {/* Row 2: 3 IAs */}
                                <div className="flex flex-row items-center gap-6">
                                    {iasData.slice(4, 7).map((ia) => (
                                        <a
                                            key={ia.name}
                                            href={ia.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/ia p-2 transition-all duration-300"
                                        >
                                            <div
                                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center group-hover/ia:scale-125 transition-transform duration-300 drop-shadow-[3px_4px_2px_rgba(255,255,255,0.25)] border-2 border-white/30"
                                            >
                                                {ia.icon}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
