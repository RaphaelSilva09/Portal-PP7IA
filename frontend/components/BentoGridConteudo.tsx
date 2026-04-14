"use client";

import { ArrowUpRight, BookOpen, GraduationCap, Heart, Library, Mail, Search, Star } from "lucide-react";
import { useHomePageDates } from "../presentation/hooks/useHomePageDates";

/**
 * BentoGrid Component - Layout "1x3x3 Hierarchy"
 * 7 Blocos de Conteúdo organizados em 3 linhas hierárquicas
 * Regra de Negócio: O número 7
 */

type BadgeColor = "blue" | "yellow" | "orange" | "green" | "purple";

const colorMap: Record<BadgeColor, { bg: string; border: string; dot: string; ping: string; text: string }> = {
    blue:   { bg: "bg-blue-600/15",   border: "border-blue-500/30",   dot: "bg-blue-600",   ping: "bg-blue-500",   text: "text-blue-700" },
    yellow: { bg: "bg-amber-600/15",  border: "border-amber-500/35",  dot: "bg-amber-600",  ping: "bg-amber-500",  text: "text-amber-800" },
    orange: { bg: "bg-orange-700/15", border: "border-orange-600/35", dot: "bg-orange-700", ping: "bg-orange-600", text: "text-orange-800" },
    green:  { bg: "bg-green-600/15",  border: "border-green-500/30",  dot: "bg-green-600",  ping: "bg-green-500",  text: "text-green-700" },
    purple: { bg: "bg-purple-600/15", border: "border-purple-500/30", dot: "bg-purple-600", ping: "bg-purple-500", text: "text-purple-700" },
};

function NovoBadge({ color }: { color: BadgeColor }) {
    const c = colorMap[color];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${c.bg} border ${c.border} rounded-full`}>
            <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.ping} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
            </span>
            <span className={`text-xs font-medium ${c.text}`}>Novo</span>
        </span>
    );
}

function BadgeSkeleton() {
    return <div className="h-8 w-20 rounded-full bg-border/80 animate-pulse" />;
}

function DetailBadge({ label }: { label: string }) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-card/90 border border-border rounded-full w-fit mt-auto">
            <span className="text-xs font-medium text-text-secondary tracking-tight">{label}</span>
        </div>
    );
}

export default function BentoGrid() {
    const { isNew, isLoading } = useHomePageDates();
    return (
        <section id="indice" className="py-8 px-4 sm:px-6 lg:px-8" style={{ scrollMarginTop: "100px" }}>
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="text-center flex flex-col gap-4 sm:gap-6">
                    <div className="flex flex-col items-center gap-1 pb-8 sm:pb-10 md:pb-12">
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                            Sobre os{" "}
                            <span className="bg-linear-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                                7 Blocos
                            </span>
                        </h3>
                        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto tracking-tight px-4">
                            Cada bloco foi projetado e revisado para entregar valor específico e complementar.
                        </p>
                    </div>
                </div>

                {/* Bento Grid - 3 Columns Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* ============================================
                    LINHA 1 - HERO (Manchete)
                    1 Card - col-span-3
                    ============================================ */}
                    <a
                        href="/newsletter"
                        id="newsletter"
                        className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.01] block cursor-pointer shadow-[0_0_0_1px_rgba(29,78,216,0.2)]"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        {/* Gradient Background */}
                        <div className="absolute inset-0 card-home-newsletter" />
                        <div className="absolute inset-0 rounded-3xl border border-blue-500/25 dark:border-white/10" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700">
                            <div className="absolute inset-0 shimmer" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col p-5 sm:p-6">
                            {/* Top */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Mail className="w-5 h-5 text-blue-700" />
                                </div>
                                <div className="absolute top-5 right-5 sm:top-6 sm:right-6">
                                    {isLoading ? (
                                        <BadgeSkeleton />
                                    ) : isNew.newsletter ? (
                                        <NovoBadge color="blue" />
                                    ) : (
                                        <ArrowUpRight className="w-5 h-5 text-text-secondary opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                                    )}
                                </div>
                            </div>

                            {/* Center */}
                            <div className="max-w-5xl flex-1">
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 tracking-tight leading-tight">
                                    <span className="bg-linear-to-r from-brand-blue via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Newsletter
                                    </span>
                                </h3>
                                <p className="text-text-secondary text-sm font-medium mb-0.5 tracking-tight">
                                    Publicação semanal com 7 itens
                                </p>
                                <p className="text-text-secondary text-sm leading-relaxed tracking-tight">
                                    Notícias de IA e startups. O que realmente importa.
                                </p>
                            </div>

                            {/* Detail badge - bottom */}
                            {isLoading ? (
                                <div className="h-7 w-20 rounded-full bg-border/80 animate-pulse mt-auto" />
                            ) : (
                                <DetailBadge label="Semanal" />
                            )}
                        </div>
                    </a>

                    {/* ============================================
                    LINHA 2 - CORE PRODUCTS
                    ============================================ */}

                    {/* Card: Reportagem da Semana */}
                    <a
                        href="/especial-semana"
                        id="especial"
                        className="col-span-1 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-700/12 via-yellow-500/8 to-card/90 backdrop-blur-sm border border-amber-500/40 transition-all duration-300 hover:from-amber-700/18 hover:via-yellow-500/12 hover:to-card/95 hover:border-amber-600/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] block"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 h-full flex flex-col p-4 sm:p-5 gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-700/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Star className="w-5 h-5 text-amber-800" />
                            </div>
                            <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                                {isLoading ? (
                                    <BadgeSkeleton />
                                ) : isNew.especial ? (
                                    <NovoBadge color="yellow" />
                                ) : (
                                    <ArrowUpRight className="w-5 h-5 text-text-secondary group-hover:text-amber-800 group-hover:scale-125 transition-all duration-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mt-1 mb-1 tracking-tight">
                                    Reportagem da Semana
                                </h4>
                                <p className="text-text-secondary text-sm font-medium mb-0.5 tracking-tight">
                                    Reportagem curada da semana
                                </p>
                                <p className="text-text-secondary text-sm tracking-tight">
                                    Análises e destaques editoriais.
                                </p>
                            </div>
                            <DetailBadge label="Semanal" />
                                <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-amber-600 via-yellow-500 to-yellow-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </a>

                    {/* Card: Radar */}
                    <a
                        href="/radar-oportunidades"
                        id="radar"
                        className="col-span-1 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-700/12 via-red-500/8 to-card/90 backdrop-blur-sm border border-orange-600/40 cursor-pointer transition-all duration-300 hover:from-orange-700/18 hover:via-red-500/12 hover:to-card/95 hover:border-orange-700/60 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] block"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 h-full flex flex-col p-4 sm:p-5 gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-700/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Search className="w-5 h-5 text-orange-800" />
                            </div>
                            <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                                {isLoading ? (
                                    <BadgeSkeleton />
                                ) : isNew.radar ? (
                                    <NovoBadge color="orange" />
                                ) : (
                                    <ArrowUpRight className="w-5 h-5 text-text-secondary group-hover:text-orange-800 group-hover:scale-125 transition-all duration-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mt-1 mb-1 tracking-tight">
                                    Radar
                                </h4>
                                <p className="text-text-secondary text-sm font-medium mb-0.5 tracking-tight">
                                    7 itens mensais
                                </p>
                                <p className="text-text-secondary text-sm tracking-tight">
                                    Ferramentas, startups e tendências.
                                </p>
                            </div>
                            <DetailBadge label="Mensal" />
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-orange-700 via-orange-600 to-red-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </a>

                    {/* Card: Mini-Livros */}
                    <a
                        href="/mini-livros"
                        id="mini-livros"
                        className="col-span-1 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600/10 via-emerald-500/8 to-card/90 backdrop-blur-sm border border-green-500/35 cursor-pointer transition-all duration-300 hover:from-green-600/15 hover:via-emerald-500/10 hover:to-card/95 hover:border-green-500/55 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] block"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 h-full flex flex-col p-4 sm:p-5 gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-600/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-5 h-5 text-green-700" />
                            </div>
                            <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                                {isLoading ? (
                                    <BadgeSkeleton />
                                ) : isNew.miniLivros ? (
                                    <NovoBadge color="green" />
                                ) : (
                                    <ArrowUpRight className="w-5 h-5 text-text-secondary group-hover:text-green-700 group-hover:scale-125 transition-all duration-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mt-1 mb-1 tracking-tight">
                                    Enquanto é Tempo
                                </h4>
                                <p className="text-text-secondary text-sm font-medium mb-0.5 tracking-tight">
                                    1 Livro, 3 Ebooks, 21 Mini-livros
                                </p>
                                <p className="text-text-secondary text-sm tracking-tight">
                                    Leitura de 7 a 21 minutos.
                                </p>
                            </div>
                            <DetailBadge label="7-21 min" />
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-green-500 to-emerald-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </a>

                    {/* ============================================
                    LINHA 3 - CORE PRODUCTS
                    ============================================ */}

                    {/* Card: Biblioteca */}
                    <a
                        href="/biblioteca"
                        id="biblioteca"
                        className="col-span-1 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/10 via-violet-500/8 to-card/90 backdrop-blur-sm border border-purple-500/35 cursor-pointer transition-all duration-300 hover:from-purple-600/15 hover:via-violet-500/10 hover:to-card/95 hover:border-purple-500/55 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] block"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 h-full flex flex-col p-4 sm:p-5 gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-600/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Library className="w-5 h-5 text-purple-700" />
                            </div>
                            <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                                {isLoading ? (
                                    <BadgeSkeleton />
                                ) : isNew.biblioteca ? (
                                    <NovoBadge color="purple" />
                                ) : (
                                    <ArrowUpRight className="w-5 h-5 text-text-secondary group-hover:text-purple-700 group-hover:scale-125 transition-all duration-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mt-1 mb-1 tracking-tight">
                                    Biblioteca
                                </h4>
                                <p className="text-text-secondary text-sm font-medium mb-0.5 tracking-tight">
                                    7 categorias com 7 itens cada
                                </p>
                                <p className="text-text-secondary text-sm tracking-tight">
                                    Prompts, ferramentas, guias e dicas.
                                </p>
                            </div>
                            <DetailBadge label="49 itens · 7x7" />
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-purple-500 to-pink-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </a>

                    {/* Card: Estudar */}
                    <a
                        href="/estudar"
                        id="estudar"
                        className="col-span-1 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/10 via-cyan-500/8 to-card/90 backdrop-blur-sm border border-blue-500/35 cursor-pointer transition-all duration-300 hover:from-blue-600/15 hover:via-cyan-500/10 hover:to-card/95 hover:border-blue-500/55 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] block"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 h-full flex flex-col p-4 sm:p-5 gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <GraduationCap className="w-5 h-5 text-blue-700" />
                            </div>
                            <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                                {isLoading ? (
                                    <BadgeSkeleton />
                                ) : isNew.estudar ? (
                                    <NovoBadge color="blue" />
                                ) : (
                                    <ArrowUpRight className="w-5 h-5 text-text-secondary group-hover:text-blue-700 group-hover:scale-125 transition-all duration-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mt-1 mb-1 tracking-tight">
                                    Estudar
                                </h4>
                                <p className="text-text-secondary text-sm font-medium mb-0.5 tracking-tight">
                                    Guias, tutoriais e aulas
                                </p>
                                <p className="text-text-secondary text-sm tracking-tight">
                                    IA, tech, saúde, startups, finanças.
                                </p>
                            </div>
                            <DetailBadge label="Contínuo" />
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-blue-500 to-cyan-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </a>

                    {/* Card: Ensinar */}
                    <div
                        id="ensinar"
                        className="col-span-1 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-600/10 via-rose-500/8 to-card/90 backdrop-blur-sm border border-pink-500/35 transition-all duration-300 hover:from-pink-600/15 hover:via-rose-500/10 hover:to-card/95 hover:border-pink-500/55 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] block"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 h-full flex flex-col p-4 sm:p-5 gap-3">
                            <div className="w-10 h-10 rounded-xl bg-pink-600/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Heart className="w-5 h-5 text-pink-700" />
                            </div>
                            <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-600/10 border border-pink-600/20 rounded-full">
                                    <span className="text-xs font-medium text-pink-700">Em breve</span>
                                </span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mt-1 mb-1 tracking-tight">
                                    Ensinar
                                </h4>
                                <p className="text-text-secondary text-sm font-medium mb-0.5 tracking-tight">
                                    A ser implementado
                                </p>
                                <p className="text-text-secondary text-sm tracking-tight">
                                    A partir de abril 2026.
                                </p>
                            </div>
                            <DetailBadge label="Em breve" />
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-pink-500 to-rose-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
