"use client";

import { FileText, Globe, Sparkles } from "lucide-react";
import NewsletterCTA from "./NewsletterCTA";

/**
 * BentoGridNewsletter Component
 * Exibe a última edição em destaque e edições anteriores em grid 3x3
 */

// Dados das newsletters (mock - substituir por dados reais)
const newsletters = [
    {
        id: 2,
        title: "PP-News #002  - IA Curada com Inteligência",
        htmlUrl: "/newsletters/002.html",
        pdfUrl: "/newsletters/002.pdf",
        date: "16/12/2025",
        htmlAvailable: true,
        pdfAvailable: true,
    },
    {
        id: 1,
        title: "PP-News #001 - O Início de uma Nova Era",
        htmlUrl: "/newsletters/001.html",
        pdfUrl: "/newsletters/001.pdf",
        date: "09/12/2025",
        htmlAvailable: true,
        pdfAvailable: false,
    },
    {
        id: 0,
        title: "PP-News #000 - Edição Piloto",
        htmlUrl: "/newsletters/000.html",
        pdfUrl: "/newsletters/000.pdf",
        date: "02/12/2025",
        htmlAvailable: true,
        pdfAvailable: false,
    },
];

export default function BentoGridNewsletter() {
    const latestNewsletter = newsletters[0];
    const olderNewsletters = newsletters.slice(1);

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Bento Grid - 3 Columns Layout */}
                <div id="last-newsletter" className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* ============================================
                    NEWSLETTER MAIS RECENTE - DESTAQUE
                    1 Card - col-span-3
                    ============================================ */}
                    <div className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-3xl min-h-100 transition-all duration-500 hover:scale-[1.01]">
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
                                    <span className="text-green-500 text-sm font-medium">Última Edição</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400 text-sm font-medium">Gratuito</span>
                                </div>
                            </div>

                            {/* Newsletter Number */}
                            <p className="text-brand-blue text-base sm:text-lg font-mono mb-2">
                                Newsletter #{latestNewsletter.id.toString().padStart(3, "0")}
                            </p>

                            {/* Title */}
                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl">
                                {latestNewsletter.title}
                            </h3>

                            {/* Date */}
                            <p className="text-text-secondary text-base sm:text-lg mb-8">
                                Publicada em {latestNewsletter.date}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                {latestNewsletter.htmlAvailable ? (
                                    <a
                                        href={latestNewsletter.htmlUrl}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/30 hover:border-brand-blue/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-[160px]"
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
                                {latestNewsletter.pdfAvailable ? (
                                    <a
                                        href={latestNewsletter.pdfUrl}
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
                    {olderNewsletters.map(newsletter => (
                        <div
                            key={newsletter.id}
                            className="col-span-1 group relative overflow-hidden rounded-3xl min-h-70 bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/[0.07] hover:border-brand-blue/30 hover:shadow-[0_0_30px_rgba(0,129,242,0.15)]"
                        >
                            <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                                {/* Newsletter Number */}
                                <span className="text-xs font-mono text-brand-blue/80 tracking-tight mb-2">
                                    Newsletter #{newsletter.id.toString().padStart(3, "0")}
                                </span>

                                {/* Title */}
                                <h4 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white mt-1 mb-2 tracking-tight">
                                    {newsletter.title}
                                </h4>

                                {/* Date */}
                                <p className="text-text-secondary text-sm mb-4">{newsletter.date}</p>

                                {/* Action Buttons */}
                                <div className="flex flex-col w-full gap-2 mt-auto">
                                    {newsletter.htmlAvailable ? (
                                        <a
                                            href={newsletter.htmlUrl}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 border border-brand-blue/20 hover:border-brand-blue/40 rounded-lg text-white text-sm font-medium transition-all duration-200"
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
                                    {newsletter.pdfAvailable ? (
                                        <a
                                            href={newsletter.pdfUrl}
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
                <NewsletterCTA />
            </div>
        </section>
    );
}
