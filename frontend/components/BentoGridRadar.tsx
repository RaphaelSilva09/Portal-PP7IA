"use client";

import { RadarOportunidades } from "@/domain/entities/RadarOportunidades";
import { useRadarOportunidades } from "@/presentation/hooks/useRadarOportunidades";
import { useScrollToHash } from "@/presentation/hooks/useScrollToHash";
import { FileText, Globe, Loader2 } from "lucide-react";

/**
 * BentoGridRadar Component
 * Exibe o radar de oportunidades mais recente em destaque e edições anteriores em grid 3x3
 * Dados carregados dinamicamente do Supabase
 */

export default function BentoGridRadar() {
    const { latest, older, isLoading, error, lastUpdated } = useRadarOportunidades();
    useScrollToHash(!isLoading);

    if (isLoading) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto flex flex-col justify-center items-center min-h-100 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    <p className="text-text-secondary">Carregando radar de oportunidades...</p>
                </div>
            </section>
        );
    }

    if (error || !latest) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-16">
                        <p className="text-text-secondary text-lg">
                            {error || "Nenhum radar de oportunidades disponível no momento."}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
            {/* Introdução */}
            <div id="introducao" className="text-center mx-auto mb-6 sm:mb-7 md:mb-8">
                <h3
                    className="text-2xl sm:text-3xl md:text-3xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl line-clamp-2 mx-auto animate-fade-in-up"
                    style={{ animationDelay: "0.3s" }}
                >
                    Radar de Oportunidades
                </h3>
                <p
                    className="text-base sm:text-2xl text-text-secondary max-w-4xl mx-auto mb-6 sm:mb-7 md:mb-2 leading-relaxed animate-fade-in-up"
                    style={{ animationDelay: "0.4s" }}
                >
                    Oportunidades identificadas com apoio de IA — tendências, cursos, ferramentas e mercado.
                </p>
            </div>

            {/* Linha divisória */}
            <div className="max-w-4xl mx-auto my-8 sm:my-10 md:my-12">
                <div className="border-t border-white/10"></div>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* RADAR MAIS RECENTE - DESTAQUE */}
                    <div id={`item-${latest.id}`} style={{ scrollMarginTop: "80px" }} className="col-span-1 md:col-span-2 group relative overflow-hidden rounded-3xl min-h-[200px] cursor-pointer transition-all duration-500 hover:scale-[1.01]">
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(109, 40, 217, 0.2), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
                            }}
                        />
                        <div className="absolute inset-0 rounded-3xl border border-white/10" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute inset-0 shimmer" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6 sm:p-12">
                            <p className="text-violet-400 text-base sm:text-lg font-mono mb-2">
                                Radar #{latest.formattedNumber}
                            </p>
                            <h3 className="text-2xl sm:text-3xl md:text-3xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl line-clamp-2">
                                {latest.title}
                            </h3>
                            <p className="text-text-secondary text-base sm:text-lg mb-8 md:mb-4 whitespace-nowrap">Publicado em&nbsp;{latest.formattedDate}</p>
                            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3">
                                {latest.htmlAvailable ? (
                                    <a
                                        href={latest.htmlPath!}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 hover:border-violet-500/50 rounded-full text-white font-medium text-sm sm:text-base transition-all duration-300 whitespace-nowrap"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Ler online</span>
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 font-medium text-sm sm:text-base cursor-not-allowed opacity-50 whitespace-nowrap"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Indisponível</span>
                                    </button>
                                )}
                                {latest.pdfAvailable ? (
                                    <a
                                        href={latest.pdfPath!}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-full text-white font-medium text-sm sm:text-base transition-all duration-300 whitespace-nowrap"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>Baixar PDF</span>
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 font-medium text-sm sm:text-base cursor-not-allowed opacity-50 whitespace-nowrap"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>Indisponível</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RADARES ANTERIORES */}
                    {older.map((item: RadarOportunidades) => (
                        <div
                            key={item.id}
                            id={`item-${item.id}`}
                            style={{ scrollMarginTop: "80px" }}
                            className="col-span-1 group relative overflow-hidden rounded-3xl min-h-[200px] bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
                        >
                            <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                                <p className="text-violet-400 text-base sm:text-lg font-mono mb-2">
                                    Radar #{item.formattedNumber}
                                </p>
                                <h4 className="text-2xl sm:text-3xl md:text-2xl font-bold text-white mt-1 mb-2 tracking-tight line-clamp-2">
                                    {item.title}
                                </h4>
                                <p className="text-text-secondary text-base sm:text-lg mb-8 md:mb-4 whitespace-nowrap">Publicado em&nbsp;{item.formattedDate}</p>
                                <div className="flex flex-wrap md:flex-nowrap gap-3 mt-auto justify-center">
                                    {item.htmlAvailable ? (
                                        <a
                                            href={item.htmlPath!}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 rounded-full text-white text-sm font-medium transition-all duration-200 whitespace-nowrap"
                                        >
                                            <Globe className="w-5 h-5" />
                                            <span>Ler online</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 text-sm font-medium cursor-not-allowed opacity-50 whitespace-nowrap"
                                        >
                                            <Globe className="w-5 h-5" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                    {item.pdfAvailable ? (
                                        <a
                                            href={item.pdfPath!}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-full text-white text-sm font-medium transition-all duration-200 whitespace-nowrap"
                                        >
                                            <FileText className="w-5 h-5" />
                                            <span>PDF</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 text-sm font-medium cursor-not-allowed opacity-50 whitespace-nowrap"
                                        >
                                            <FileText className="w-5 h-5" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-violet-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
