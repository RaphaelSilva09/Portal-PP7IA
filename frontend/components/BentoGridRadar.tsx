"use client";

import { portalContentClass } from "@/lib/layout";
import { RadarOportunidades } from "@/domain/entities/RadarOportunidades";
import { useRadarOportunidades } from "@/presentation/hooks/useRadarOportunidades";
import { useScrollToHash } from "@/presentation/hooks/useScrollToHash";
import { FileText, Globe, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * BentoGridRadar Component
 * Exibe o radar de oportunidades mais recente em destaque e edições anteriores em grid 3x3
 * Dados carregados dinamicamente do Postgres
 */

export default function BentoGridRadar() {
    const { latest, older, isLoading, error } = useRadarOportunidades();
    const { resolvedTheme } = useTheme();
    const isLight = resolvedTheme === "light";
    useScrollToHash(!isLoading);

    if (isLoading) {
        return (
            <section className="py-12">
                <div className={portalContentClass}>
                    <div className="max-w-4xl mx-auto flex flex-col justify-center items-center min-h-100 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                        <p className="text-text-secondary">Carregando radar de oportunidades...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error || !latest) {
        return (
            <section className="py-12">
                <div className={portalContentClass}>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center py-16">
                            <p className="text-text-secondary text-lg">
                                {error || "Nenhum editorial ou artigo disponível no momento."}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12">
            <div className={portalContentClass}>
                {/* Introdução */}
                <div id="introducao" className="mx-auto mb-6 max-w-4xl text-center sm:mb-7 md:mb-8">
                    <h3 className="text-2xl sm:text-3xl md:text-3xl font-bold text-foreground mb-4 tracking-tight leading-tight max-w-3xl line-clamp-2 mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                        Editoriais e Artigos
                    </h3>
                    <p
                        className="text-base sm:text-2xl text-text-secondary max-w-4xl mx-auto mb-6 sm:mb-7 md:mb-2 leading-relaxed animate-fade-in-up"
                        style={{ animationDelay: "0.4s" }}
                    >
                        Textos curtos, opinião editorial e artigos selecionados para leitura objetiva.
                    </p>
                </div>

                {/* Linha divisória */}
                <div className="my-8 w-full sm:my-10 md:my-12">
                <div className="border-t border-border"></div>
                </div>

                <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* RADAR MAIS RECENTE - DESTAQUE */}
                    <div id={`item-${latest.id}`} style={{ scrollMarginTop: "80px" }} className="col-span-1 md:col-span-2 group relative overflow-hidden rounded-3xl min-h-[200px] cursor-pointer transition-transform duration-500 hover:scale-[1.01]">
                        <div
                            className="absolute inset-0"
                            style={{
                                background: isLight
                                    ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249, 115, 22, 0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(234, 88, 12, 0.08), transparent), linear-gradient(180deg, #fff8f1 0%, #ffedd5 100%)"
                                    : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249, 115, 22, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(234, 88, 12, 0.2), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
                            }}
                        />
                        <div className="absolute inset-0 rounded-3xl border border-border" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute inset-0 shimmer" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6 sm:p-12">
                            <p className="text-orange-700 text-base sm:text-lg font-mono mb-2">
                                Artigo #{latest.formattedNumber}
                            </p>
                            <h3 className="text-2xl sm:text-3xl md:text-3xl font-bold text-foreground mb-4 tracking-tight leading-tight max-w-3xl line-clamp-2">
                                {latest.title}
                            </h3>
                            <p className="text-text-secondary text-base sm:text-lg mb-8 md:mb-4 whitespace-nowrap">Publicado em&nbsp;{latest.formattedDate}</p>
                            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3">
                                {latest.htmlAvailable ? (
                                    <a
                                        href={latest.htmlPath!}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-700 hover:bg-orange-800 border border-orange-800 rounded-full text-white font-medium text-sm sm:text-base transition-colors duration-300 whitespace-nowrap"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Ler agora</span>
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 font-medium text-sm sm:text-base cursor-not-allowed opacity-90 whitespace-nowrap"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Indisponível</span>
                                    </button>
                                )}
                                {latest.pdfAvailable ? (
                                    <a
                                        href={latest.pdfPath!}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 border border-amber-800 rounded-full text-white font-medium text-sm sm:text-base transition-colors duration-300 whitespace-nowrap"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>Baixar PDF</span>
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 font-medium text-sm sm:text-base cursor-not-allowed opacity-90 whitespace-nowrap"
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
                            className="col-span-1 group relative overflow-hidden rounded-3xl min-h-[200px] bg-card/80 backdrop-blur-sm border border-border cursor-pointer transition duration-300 hover:bg-accent/40 hover:border-orange-500/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]"
                        >
                            <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                                <p className="text-orange-700 text-base sm:text-lg font-mono mb-2">
                                    Artigo #{item.formattedNumber}
                                </p>
                                <h4 className="text-2xl sm:text-3xl md:text-2xl font-bold text-foreground mt-1 mb-2 tracking-tight line-clamp-2">
                                    {item.title}
                                </h4>
                                <p className="text-text-secondary text-base sm:text-lg mb-8 md:mb-4 whitespace-nowrap">Publicado em&nbsp;{item.formattedDate}</p>
                                <div className="flex flex-wrap md:flex-nowrap gap-3 mt-auto justify-center">
                                    {item.htmlAvailable ? (
                                        <a
                                            href={item.htmlPath!}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-700 hover:bg-orange-800 border border-orange-800 rounded-full text-white text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                                        >
                                            <Globe className="w-5 h-5" />
                                            <span>Ler agora</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 text-sm font-medium cursor-not-allowed opacity-90 whitespace-nowrap"
                                        >
                                            <Globe className="w-5 h-5" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                    {item.pdfAvailable ? (
                                        <a
                                            href={item.pdfPath!}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 border border-amber-800 rounded-full text-white text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                                        >
                                            <FileText className="w-5 h-5" />
                                            <span>PDF</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 text-sm font-medium cursor-not-allowed opacity-90 whitespace-nowrap"
                                        >
                                            <FileText className="w-5 h-5" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-orange-600 via-amber-500 to-orange-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            </div>
        </section>
    );
}
