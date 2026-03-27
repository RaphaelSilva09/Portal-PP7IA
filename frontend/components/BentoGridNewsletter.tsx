"use client";

import { FileText, Globe, Loader2, Sparkles } from "lucide-react";

import { Newsletter } from "@/domain/entities/Newsletter";
import { useNewsletters } from "@/presentation/hooks/useNewsletters";
import { useScrollToHash } from "@/presentation/hooks/useScrollToHash";

/**
 * BentoGridNewsletter Component
 * Exibe a última edição em destaque e edições anteriores em grid 3x3
 * Dados carregados dinamicamente do Supabase
 */
export default function BentoGridNewsletter() {
    const { latest, older, isLoading, error, lastUpdated } = useNewsletters();
    useScrollToHash(!isLoading);

    // Estado de carregamento
    if (isLoading) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col justify-center items-center min-h-[400px] gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
                    <p className="text-text-secondary">Carregando newsletters...</p>
                </div>
            </section>
        );
    }

    // Estado de erro ou sem dados
    if (error || !latest) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-16">
                        <p className="text-text-secondary text-lg">
                            {error || "Nenhuma newsletter disponível no momento."}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
            {/* Introdução Newsletter */}
            <div id="introducao" className="text-center mx-auto mb-6 sm:mb-7 md:mb-8">
                {/* Título da Introdução */}
                <h3
                    id="titulo"
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl mx-auto animate-fade-in-up"
                    style={{ animationDelay: "0.3s" }}
                >
                    Newsletters
                </h3>

                {/* Descrição Newsletter */}
                <p
                    id="descricao"
                    className="text-base sm:text-2xl text-text-secondary max-w-2xl mx-auto mb-6 sm:mb-7 md:mb-2 leading-relaxed animate-fade-in-up"
                    style={{ animationDelay: "0.4s" }}
                >
                    Notícias semanais sobre as principais tecnologias
                </p>
            </div>

            {/* Linha divisória cinza */}
            <div className="max-w-7xl mx-auto my-8 sm:my-10 md:my-12">
                <div className="border-t border-white/10"></div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Bento Grid - 3 Columns Layout */}
                <div id="last-newsletter" className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* ============================================
                    NEWSLETTER MAIS RECENTE - DESTAQUE
                    1 Card - col-span-3
                    ============================================ */}
                    <div id={`item-${latest.id}`} style={{ scrollMarginTop: "80px" }} className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-3xl min-h-100 transition-all duration-500 hover:scale-[1.01]">
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
                        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8 sm:p-12">
                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                    </span>
                                    <span className="text-green-500 text-sm font-medium">
                                        Última Edição
                                        {lastUpdated
                                            ? `: ${lastUpdated.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}`
                                            : ""}
                                    </span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400 text-sm font-medium">Gratuito</span>
                                </div>
                            </div>

                            {/* Newsletter Number */}
                            <p className="text-brand-blue text-base sm:text-lg font-mono mb-2">
                                Newsletter #{latest.formattedNumber}
                            </p>

                            {/* Title */}
                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl">
                                {latest.title}
                            </h3>

                            {/* Date */}
                            <p className="text-text-secondary text-base sm:text-lg mb-8">
                                Publicada em {latest.formattedDate}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                {latest.htmlAvailable ? (
                                    <a
                                        href={latest.htmlPath!}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/30 hover:border-brand-blue/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-[160px]"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Ler online</span>
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
                                {latest.pdfAvailable ? (
                                    <a
                                        href={latest.pdfPath!}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/30 hover:border-brand-purple/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-[160px]"
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
                    EDIÇÕES ANTERIORES - GRID 3x3
                    ============================================ */}
                    {older.map((newsletter: Newsletter) => (
                        <div
                            key={newsletter.id}
                            id={`item-${newsletter.id}`}
                            style={{ scrollMarginTop: "80px" }}
                            className="col-span-1 group relative overflow-hidden rounded-3xl min-h-70 bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/[0.07] hover:border-brand-blue/30 hover:shadow-[0_0_30px_rgba(0,129,242,0.15)]"
                        >
                            <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                                {/* Newsletter Number */}
                                <span className="text-xs font-mono text-brand-blue/80 tracking-tight mb-2">
                                    Newsletter #{newsletter.formattedNumber}
                                </span>

                                {/* Title */}
                                <h4 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white mt-1 mb-2 tracking-tight">
                                    {newsletter.title}
                                </h4>

                                {/* Date */}
                                <p className="text-text-secondary text-sm mb-4">{newsletter.formattedDate}</p>

                                {/* Action Buttons */}
                                <div className="flex flex-col w-full gap-2 mt-auto">
                                    {newsletter.htmlAvailable ? (
                                        <a
                                            href={newsletter.htmlPath!}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 border border-brand-blue/20 hover:border-brand-blue/40 rounded-lg text-white text-sm font-medium transition-all duration-200"
                                        >
                                            <Globe className="w-4 h-4" />
                                            <span>Ler online</span>
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
                                    {newsletter.pdfAvailable ? (
                                        <a
                                            href={newsletter.pdfPath!}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-purple/10 hover:bg-brand-purple/20 border border-brand-purple/20 hover:border-brand-purple/40 rounded-lg text-white text-sm font-medium transition-all duration-200"
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
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-brand-blue to-brand-purple transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
