"use client";

import { FileText, Globe } from "lucide-react";

/**
 * BentoGridNewsletter Component
 * Exibe a última edição em destaque e edições anteriores em grid 3x3
 */

// Dados das newsletters (mock - substituir por dados reais)
const newsletters = [
    {
        id: 4,
        title: "PP-News #000 - O Início de uma Nova Era",
        htmlUrl: "/newsletters/004.html",
        pdfUrl: "/newsletters/004.pdf",
        date: "13/01/2026",
    },
    {
        id: 3,
        title: "Transformação Digital: Cases de Sucesso",
        htmlUrl: "/newsletters/003.html",
        pdfUrl: "/newsletters/003.pdf",
        date: "06/01/2026",
    },
    {
        id: 2,
        title: "Machine Learning na Prática",
        htmlUrl: "/newsletters/002.html",
        pdfUrl: "/newsletters/002.pdf",
        date: "30/12/2025",
    },
    {
        id: 1,
        title: "Introdução à Curadoria de IA",
        htmlUrl: "/newsletters/001.html",
        pdfUrl: "/newsletters/001.pdf",
        date: "23/12/2025",
    },
    {
        id: 0,
        title: "Bem-vindo ao PP7+IAS",
        htmlUrl: "/newsletters/000.html",
        pdfUrl: "/newsletters/000.pdf",
        date: "16/12/2025",
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
                    <div className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-3xl min-h-100 cursor-pointer transition-all duration-500 hover:scale-[1.01]">
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
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                </span>
                                <span className="text-green-500 text-sm font-medium">Última Edição</span>
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
                                <a
                                    href={latestNewsletter.htmlUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/30 hover:border-brand-blue/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-[160px]"
                                >
                                    <Globe className="w-5 h-5" />
                                    <span>Ver HTML</span>
                                </a>
                                <a
                                    href={latestNewsletter.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/30 hover:border-brand-purple/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-[160px]"
                                >
                                    <FileText className="w-5 h-5" />
                                    <span>Baixar PDF</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* ============================================
                    EDIÇÕES ANTERIORES - GRID 3x3
                    ============================================ */}
                    {olderNewsletters.map(newsletter => (
                        <div
                            key={newsletter.id}
                            className="col-span-1 group relative overflow-hidden rounded-3xl min-h-70 bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-brand-blue/30 hover:shadow-[0_0_30px_rgba(0,129,242,0.15)]"
                        >
                            <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                                {/* Newsletter Number */}
                                <span className="text-xs font-mono text-brand-blue/80 tracking-tight mb-2">
                                    Newsletter #{newsletter.id.toString().padStart(3, "0")}
                                </span>

                                {/* Title */}
                                <h4 className="text-lg sm:text-xl font-bold text-white mb-3 tracking-tight line-clamp-2 flex-grow">
                                    {newsletter.title}
                                </h4>

                                {/* Date */}
                                <p className="text-text-secondary text-sm mb-4">{newsletter.date}</p>

                                {/* Action Buttons */}
                                <div className="flex flex-col w-full gap-2 mt-auto">
                                    <a
                                        href={newsletter.htmlUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 border border-brand-blue/20 hover:border-brand-blue/40 rounded-lg text-white text-sm font-medium transition-all duration-200"
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span>HTML</span>
                                    </a>
                                    <a
                                        href={newsletter.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-purple/10 hover:bg-brand-purple/20 border border-brand-purple/20 hover:border-brand-purple/40 rounded-lg text-white text-sm font-medium transition-all duration-200"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>PDF</span>
                                    </a>
                                </div>

                                {/* Accent Line */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-brand-blue to-brand-purple transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Newsletter CTA */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 mt-12">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                                Receba nossa curadoria semanal
                            </h3>
                            <p className="text-text-secondary text-base sm:text-2xl">
                                7 insights essenciais toda semana, direto no seu email.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                className="flex-1 sm:w-64 px-4 py-3 bg-bg-primary border border-border-glass rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-brand-blue transition-colors touch-target"
                            />
                            <button className="px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-glow-green hover:scale-105 active:scale-95 transition-transform duration-200 touch-target whitespace-nowrap">
                                Inscrever-se
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
