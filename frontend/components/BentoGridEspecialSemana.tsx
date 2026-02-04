"use client";

import { FileText, Globe, Sparkles, Star } from "lucide-react";

/**
 * BentoGridEspecialSemana Component
 * Exibe o especial da semana em destaque e edições anteriores em grid 3x3
 */

// Dados dos especiais (mock - substituir por dados reais)
const especialItems = [
    {
        id: 1,
        title: "Brasil no Radar",
        description: "Destaque editorial semanal com artigos, apps, tutoriais ou pontos de atenção especial.",
        htmlUrl: "/especial-semana/001.html",
        pdfUrl: "/especial-semana/001.pdf",
        date: "25/01/2026",
        category: "Artigo",
        htmlAvailable: true,
        pdfAvailable: false,
    },
];

export default function BentoGridEspecialSemana() {
    const latestItem = especialItems[0];
    const olderItems = especialItems.slice(1);

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
            {/* Introdução Especial da Semana */}
            <div id="introducao" className="text-center mx-auto mb-6 sm:mb-7 md:mb-8">
                {/* Título da Introdução */}
                <h3
                    id="titulo"
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl mx-auto animate-fade-in-up"
                    style={{ animationDelay: "0.3s" }}
                >
                    Especial da Semana
                </h3>

                {/* Descrição */}
                <p
                    id="descricao"
                    className="text-base sm:text-2xl text-text-secondary max-w-2xl mx-auto mb-6 sm:mb-7 md:mb-2 leading-relaxed animate-fade-in-up"
                    style={{ animationDelay: "0.4s" }}
                >
                    Destaque editorial semanal: artigos, apps, tutoriais ou pontos de atenção especial.
                </p>
            </div>

            {/* Linha divisória */}
            <div className="max-w-7xl mx-auto my-8 sm:my-10 md:my-12">
                <div className="border-t border-white/10"></div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Bento Grid - 3 Columns Layout */}
                <div id="last-especial" className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* ============================================
                    ESPECIAL MAIS RECENTE - DESTAQUE
                    1 Card - col-span-3
                    ============================================ */}
                    <div className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-3xl min-h-100 cursor-pointer transition-all duration-500 hover:scale-[1.01]">
                        {/* Gradient Background */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(234, 179, 8, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(245, 158, 11, 0.2), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
                            }}
                        />

                        {/* Subtle Border */}
                        <div className="absolute inset-0 rounded-3xl border border-white/10" />

                        {/* Shimmer on Hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute inset-0 shimmer" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8 sm:p-12">
                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
                                    </span>
                                    <span className="text-yellow-500 text-sm font-medium">Especial da Semana</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400 text-sm font-medium">Gratuito</span>
                                </div>
                            </div>

                            {/* Especial Number */}
                            <p className="text-yellow-400 text-base sm:text-lg font-mono mb-2">
                                Especial #{latestItem.id.toString().padStart(3, "0")}
                            </p>

                            {/* Title */}
                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl">
                                {latestItem.title}
                            </h3>

                            {/* Category and Date */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-text-secondary text-base sm:text-lg mb-8">
                                <p className="text-yellow-400/80">{latestItem.category}</p>
                                <span className="hidden sm:inline">•</span>
                                <p>Publicado em {latestItem.date}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                {latestItem.htmlAvailable ? (
                                    <a
                                        href={latestItem.htmlUrl}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 hover:border-yellow-500/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-[160px]"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Ver HTML</span>
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 font-medium text-base sm:text-lg cursor-not-allowed w-full sm:w-auto min-w-[160px] opacity-50"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Indisponível</span>
                                    </button>
                                )}
                                {latestItem.pdfAvailable ? (
                                    <a
                                        href={latestItem.pdfUrl}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-[160px]"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>Baixar PDF</span>
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 font-medium text-base sm:text-lg cursor-not-allowed w-full sm:w-auto min-w-[160px] opacity-50"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>Indisponível</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ============================================
                    ESPECIAIS ANTERIORES - GRID 3x3
                    ============================================ */}
                    {olderItems.map(item => (
                        <div
                            key={item.id}
                            className="col-span-1 group relative overflow-hidden rounded-3xl min-h-80 bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-yellow-500/30 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]"
                        >
                            <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                                {/* Especial Number */}
                                <span className="text-xs font-mono text-yellow-400/80 tracking-tight mb-2">
                                    Especial #{item.id.toString().padStart(3, "0")}
                                </span>

                                {/* Title */}
                                <h4 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white mt-1 mb-2 tracking-tight">
                                    {item.title}
                                </h4>

                                {/* Category and Date */}
                                <div className="flex flex-col gap-1 text-text-secondary text-sm mb-4">
                                    <p className="text-yellow-400/70">{item.category}</p>
                                    <p>{item.date}</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col w-full gap-2 mt-auto">
                                    {item.htmlAvailable ? (
                                        <a
                                            href={item.htmlUrl}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 hover:border-yellow-500/40 rounded-lg text-white text-sm font-medium transition-all duration-200"
                                        >
                                            <Globe className="w-4 h-4" />
                                            <span>HTML</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500/10 border border-gray-500/20 rounded-lg text-gray-500 text-sm font-medium cursor-not-allowed opacity-50"
                                        >
                                            <Globe className="w-4 h-4" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                    {item.pdfAvailable ? (
                                        <a
                                            href={item.pdfUrl}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 rounded-lg text-white text-sm font-medium transition-all duration-200"
                                        >
                                            <FileText className="w-4 h-4" />
                                            <span>PDF</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500/10 border border-gray-500/20 rounded-lg text-gray-500 text-sm font-medium cursor-not-allowed opacity-50"
                                        >
                                            <FileText className="w-4 h-4" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                </div>

                                {/* Accent Line */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-yellow-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
