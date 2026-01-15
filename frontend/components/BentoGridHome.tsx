"use client";

import {
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    GraduationCap,
    Heart,
    Library,
    Search,
    Sparkles,
    Star,
} from "lucide-react";
import NewsletterCTA from "./NewsletterCTA";

/**
 * BentoGrid Component - Layout "1x3x3 Hierarchy"
 * 7 Blocos de Conteúdo organizados em 3 linhas hierárquicas
 * Regra de Negócio: O número 7
 */

export default function BentoGrid() {
    return (
        <section className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center flex flex-col gap-6 sm:gap-8">
                    {/* Títulos e Descrição */}
                    <div className="flex flex-col items-center gap-1 pb-16 sm:pb-20 md:pb-24">
                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                            Sobre os{" "}
                            <span className="bg-linear-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                                7 Blocos
                            </span>
                        </h3>
                        <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto tracking-tight px-4">
                            Cada bloco foi projetado e revisado para entregar valor específico e complementar.
                        </p>
                    </div>
                </div>

                {/* Bento Grid - 3 Columns Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* ============================================
                    LINHA 1 - HERO (Manchete)
                    1 Card - col-span-3 - min-h-[400px]
                    ============================================ */}
                    <div
                        id="newsletter"
                        className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-3xl min-h-80 transition-all duration-500 hover:scale-[1.01]"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        {/* Gradient Background */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 129, 242, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99, 102, 241, 0.2), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
                            }}
                        />

                        {/* Subtle Border */}
                        <div className="absolute inset-0 rounded-3xl border border-white/10" />

                        {/* Shimmer on Hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute inset-0 shimmer" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-between p-8 sm:p-12">
                            {/* Top */}
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full mb-6">
                                    <Sparkles className="w-4 h-4 text-brand-blue" />
                                    <span className="text-xs font-medium text-gray-300 tracking-tight">
                                        Novas atualizações
                                    </span>
                                </div>
                            </div>

                            {/* Center */}
                            <div className="max-w-5xl">
                                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 tracking-tight leading-tight">
                                    <span className="bg-linear-to-r from-brand-blue via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                        Newsletter PP7+IAS
                                    </span>
                                </h3>
                                <p className="text-gray-400 text-base sm:text-1xl leading-relaxed tracking-tight">
                                    Publicação semanal com 7 itens: notícias de IA e startups. Mantendo você informado
                                    sobre o que realmente importa.
                                </p>
                            </div>

                            {/* Bottom */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                                <a
                                    href="/newsletter"
                                    className="flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-white font-medium text-base transition-all duration-300 group/btn w-auto"
                                >
                                    <span className="tracking-tight">Última edição</span>
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* ============================================
                    LINHA 2 - CORE PRODUCTS (Corpo)
                    3 Cards - col-span-1 cada - ~280px
                    ============================================ */}

                    {/* Card: Especial da Semana */}
                    <a
                        // href="/especial"
                        id="especial"
                        className="col-span-1 group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-yellow-500/30 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] block min-h-80"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 h-full flex flex-col p-6 sm:p-8 gap-8">
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Star className="w-8 h-8 text-yellow-400" />
                            </div>

                            {/* Arrow Icon */}
                            <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
                                <ArrowUpRight className="w-8 h-8 text-gray-400 group-hover:text-yellow-400 group-hover:scale-125 transition-all duration-300" />
                            </div>

                            {/* Content */}
                            <div>
                                <span className="text-xs mb-2 font-mono text-gray-500 tracking-tight">BLOCO 02</span>
                                <h4 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white mt-1 mb-2 tracking-tight">
                                    Especial da Semana
                                </h4>
                                <p className="text-gray-400 mb-1.5 text-base sm:text-1xl tracking-tight">
                                    Destaque editorial semanal: artigos, apps, tutoriais ou pontos de atenção especial.
                                </p>
                            </div>

                            {/* Accent Line */}
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-yellow-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        </div>
                    </a>

                    {/* Card: Radar de Oportunidades */}
                    <a
                        // href="/radar"
                        id="radar"
                        className="col-span-1 group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-orange-500/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] block min-h-80"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 h-full flex flex-col p-6 sm:p-8 gap-8">
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Search className="w-8 h-8 text-orange-400" />
                            </div>

                            {/* Arrow Icon */}
                            <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
                                <ArrowUpRight className="w-8 h-8 text-gray-400 group-hover:text-orange-400 group-hover:scale-125 transition-all duration-300" />
                            </div>

                            {/* Content */}
                            <div>
                                <span className="text-xs mb-2 font-mono text-gray-500 tracking-tight">BLOCO 03</span>
                                <h4 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white mt-1 mb-2 tracking-tight">
                                    Radar de Oportunidades
                                </h4>
                                <p className="text-gray-400 mb-1.5 text-base sm:text-1xl tracking-tight">
                                    7 itens mensais: 3 novas ferramentas, 3 startups em alta e 1 tendência de mercado.
                                </p>
                            </div>

                            {/* Accent Line */}
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-orange-500 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        </div>
                    </a>

                    {/* Card: Mini-Livros */}
                    <a
                        href="/mini-livros"
                        id="mini-livros"
                        className="col-span-1 group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] block min-h-80"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 h-full flex flex-col p-6 sm:p-8 gap-8">
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-8 h-8 text-green-400" />
                            </div>

                            {/* Arrow Icon */}
                            <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
                                <ArrowUpRight className="w-8 h-8 text-gray-400 group-hover:text-green-400 group-hover:scale-125 transition-all duration-300" />
                            </div>

                            {/* Content */}
                            <div>
                                <span className="text-xs mb-2 font-mono text-gray-500 tracking-tight">BLOCO 04</span>
                                <h4 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white mt-1 mb-2 tracking-tight">
                                    Mini-Livros
                                </h4>
                                <p className="text-gray-400 mb-1.5 text-base sm:text-1xl tracking-tight">
                                    Mini-guias mensais sobre pessoas, liderança e IA prática. Tempo de leitura entre 7 e
                                    21 min.
                                </p>
                            </div>

                            {/* Accent Line */}
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        </div>
                    </a>

                    {/* ============================================
                    LINHA 3 - CORE PRODUCTS (Corpo)
                    3 Cards - col-span-1 cada - ~280px
                    ============================================ */}

                    {/* Card: Biblioteca */}
                    <a
                        href="/biblioteca"
                        id="biblioteca"
                        className="col-span-1 group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] block min-h-80"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 h-full flex flex-col p-6 sm:p-8 gap-8">
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Library className="w-8 h-8 text-purple-400" />
                            </div>

                            {/* Arrow Icon */}
                            <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
                                <ArrowUpRight className="w-8 h-8 text-gray-400 group-hover:text-purple-400 group-hover:scale-125 transition-all duration-300" />
                            </div>

                            {/* Content */}
                            <div>
                                <span className="text-xs mb-2 font-mono text-gray-500 tracking-tight">BLOCO 05</span>
                                <h4 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white mt-1 mb-2 tracking-tight">
                                    Biblioteca
                                </h4>
                                <p className="text-gray-400 mb-1.5 text-base sm:text-1xl tracking-tight">
                                    7 categorias com 7 itens cada: prompts, ferramentas, atalhos, guias e referências.
                                </p>
                            </div>

                            {/* Accent Line */}
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        </div>
                    </a>

                    {/* Card: Estudar — Aprender — Referências */}
                    <a
                        // href="/estudar"
                        id="estudar"
                        className="col-span-1 group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] block min-h-80"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 h-full flex flex-col p-6 sm:p-8 gap-8">
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <GraduationCap className="w-8 h-8 text-blue-400" />
                            </div>

                            {/* Arrow Icon */}
                            <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
                                <ArrowUpRight className="w-8 h-8 text-gray-400 group-hover:text-blue-400 group-hover:scale-125 transition-all duration-300" />
                            </div>

                            {/* Content */}
                            <div>
                                <span className="text-xs mb-2 font-mono text-gray-500 tracking-tight">BLOCO 06</span>
                                <h4 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white mt-1 mb-2 tracking-tight">
                                    Estudar
                                </h4>
                                <p className="text-gray-400 mb-1.5 text-base sm:text-1xl tracking-tight">
                                    Guias, tutoriais e aulas sobre IA, Tecnologia, Apple, Saúde, Startups e Finanças.
                                </p>
                            </div>

                            {/* Accent Line */}
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        </div>
                    </a>

                    {/* Card: Patrocínio de Estudos */}
                    <a
                        // href="/ensinar"
                        id="ensinar"
                        className="col-span-1 group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-pink-500/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] block min-h-80"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 h-full flex flex-col p-6 sm:p-8 gap-8">
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Heart className="w-8 h-8 text-pink-400" />
                            </div>

                            {/* Arrow Icon */}
                            <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
                                <ArrowUpRight className="w-8 h-8 text-gray-400 group-hover:text-pink-400 group-hover:scale-125 transition-all duration-300" />
                            </div>

                            {/* Content */}
                            <div>
                                <span className="text-xs mb-2 font-mono text-gray-500 tracking-tight">BLOCO 07</span>
                                <h4 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white mt-1 mb-2 tracking-tight">
                                    Ensinar
                                </h4>
                                <p className="text-gray-400 mb-1.5 text-base sm:text-1xl tracking-tight">
                                    Para líderes, inovadores, profissionais e iniciantes.
                                </p>
                            </div>

                            {/* Accent Line */}
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-pink-500 to-rose-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        </div>
                    </a>
                </div>

                <NewsletterCTA />
            </div>
        </section>
    );
}
